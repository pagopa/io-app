import { testSaga } from "redux-saga-test-plan";
import { left, right } from "fp-ts/lib/Either";
import { cdcEnrollUserToBonus } from "../../../store/actions/cdcBonusRequest";
import {
  handlePostRegistraBeneficiario,
  testableFunctions
} from "../handlePostRegistraBeneficiario";
import {
  CdcSelectedBonusList,
  RequestOutcomeEnum
} from "../../../types/CdcBonusRequest";
import { Anno } from "../../../../../../../definitions/cdc/Anno";
import { ListaEsitoRichiestaPerAnno } from "../../../../../../../definitions/cdc/ListaEsitoRichiestaPerAnno";
import { EsitoRichiestaEnum } from "../../../../../../../definitions/cdc/EsitoRichiesta";
import { RichiestaCartaErrata } from "../../../../../../../definitions/cdc/RichiestaCartaErrata";
import { RichiestaCartaErrataMotivoEnum } from "../../../../../../../definitions/cdc/RichiestaCartaErrataMotivo";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";

const mockSelectedBonusesResidenceInItaly: CdcSelectedBonusList = [
  { year: "2020" as Anno, residence: "italy" },
  { year: "2021" as Anno, residence: "italy" },
  { year: "2022" as Anno, residence: "italy" }
];

const mockSelectedBonusesResidenceAbroad: CdcSelectedBonusList = [
  { year: "2020" as Anno, residence: "notItaly" },
  { year: "2021" as Anno, residence: "notItaly" },
  { year: "2022" as Anno, residence: "notItaly" }
];

const mockSelectedBonusesMixedResidence: CdcSelectedBonusList = [
  { year: "2020" as Anno, residence: "italy" },
  { year: "2021" as Anno, residence: "notItaly" },
  { year: "2022" as Anno, residence: "italy" }
];

const successResponse = {
  status: 200,
  value: {
    listaEsitoRichiestaPerAnno: [
      {
        esitoRichiesta: EsitoRichiestaEnum.OK,
        annoRiferimento: "2020" as Anno
      },
      {
        esitoRichiesta: EsitoRichiestaEnum.CIT_REGISTRATO,
        annoRiferimento: "2021" as Anno
      },
      {
        esitoRichiesta: EsitoRichiestaEnum.ANNO_NON_AMMISSIBILE,
        annoRiferimento: "2022" as Anno
      }
    ]
  } as ListaEsitoRichiestaPerAnno
};
const totallySuccessResponse = {
  status: 200,
  value: {
    listaEsitoRichiestaPerAnno: [
      {
        esitoRichiesta: EsitoRichiestaEnum.OK,
        annoRiferimento: "2020" as Anno
      },
      {
        esitoRichiesta: EsitoRichiestaEnum.OK,
        annoRiferimento: "2022" as Anno
      }
    ]
  } as ListaEsitoRichiestaPerAnno
};
const totallyWrongResponse = {
  status: 200,
  value: {
    listaEsitoRichiestaPerAnno: [
      {
        esitoRichiesta: EsitoRichiestaEnum.ANNO_NON_AMMISSIBILE,
        annoRiferimento: "2020" as Anno
      },
      {
        esitoRichiesta: EsitoRichiestaEnum.CIT_REGISTRATO,
        annoRiferimento: "2022" as Anno
      }
    ]
  } as ListaEsitoRichiestaPerAnno
};

const wrongRequestResponse = {
  status: 400,
  value: {
    annoRiferimento: "2020" as Anno,
    status: RichiestaCartaErrataMotivoEnum.FORMATO_ANNI_ERRATO
  } as RichiestaCartaErrata
};
const genericBadRequestResponse = {
  status: 401
};

describe("handlePostRegistraBeneficiario", () => {
  const mockBackendCdcClient = jest.fn();

  it("Should dispatch cdcEnrollUserToBonus.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(mockSelectedBonusesResidenceInItaly)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(
          mockSelectedBonusesResidenceInItaly
        )
      )
      .next(right(successResponse))
      .put(
        cdcEnrollUserToBonus.success(
          testableFunctions.convertSuccess!(successResponse.value, [])
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcEnrollUserToBonus.success with kind requirementsError if for all the requested bonus the user is resident abroad", () => {
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(mockSelectedBonusesResidenceAbroad)
    )
      .next()
      .put(
        cdcEnrollUserToBonus.success({
          kind: "requirementsError"
        })
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcEnrollUserToBonus.success if the status code is 400", () => {
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(mockSelectedBonusesResidenceInItaly)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(
          mockSelectedBonusesResidenceInItaly
        )
      )
      .next(right(wrongRequestResponse))
      .put(
        cdcEnrollUserToBonus.success({
          kind: "wrongFormat",
          reason: wrongRequestResponse.value.status
        })
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcEnrollUserToBonus.failure with the status code if the response is right and the status code is different from 200 and 400", () => {
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(mockSelectedBonusesResidenceInItaly)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(
          mockSelectedBonusesResidenceInItaly
        )
      )
      .next(right(genericBadRequestResponse))
      .put(
        cdcEnrollUserToBonus.failure(
          getGenericError(
            new Error(genericBadRequestResponse.status.toString())
          )
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcEnrollUserToBonus.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(mockSelectedBonusesResidenceInItaly)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(
          mockSelectedBonusesResidenceInItaly
        )
      )
      .next(left(new Error()))
      .put(
        cdcEnrollUserToBonus.failure(
          getGenericError(
            new Error("Invalid payload from postRegistraBeneficiario")
          )
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcEnrollUserToBonus.failure with the error message as payload if an exception is raised", () => {
    const mockedError = new Error("mockedErrorMessage");
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(mockSelectedBonusesResidenceInItaly)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(
          mockSelectedBonusesResidenceInItaly
        )
      )
      .throw(mockedError)
      .put(cdcEnrollUserToBonus.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});

describe("convertSuccess", () => {
  it("should return kind partialSuccess and as value the list of input year with the status if there is at least a year with residence abroad", () => {
    const response = testableFunctions.convertSuccess!(
      totallySuccessResponse.value,
      mockSelectedBonusesMixedResidence.filter(b => b.residence === "notItaly")
    );

    expect(response.kind).toBe("partialSuccess");
    if (response.kind === "partialSuccess") {
      expect(response.value).toStrictEqual([
        ...totallySuccessResponse.value.listaEsitoRichiestaPerAnno.map(b => ({
          year: b.annoRiferimento,
          outcome: b.esitoRichiesta
        })),
        ...mockSelectedBonusesMixedResidence
          .filter(b => b.residence === "notItaly")
          .map(b => ({
            year: b.year,
            outcome: RequestOutcomeEnum.RESIDENCE_ABROAD
          }))
      ]);
    }
  });
  it("should return kind partialSuccess and as value the list of input year with the status if there is at least a year with status not OK", () => {
    const response = testableFunctions.convertSuccess!(
      successResponse.value,
      []
    );

    expect(response.kind).toBe("partialSuccess");
    if (response.kind === "partialSuccess") {
      expect(response.value).toStrictEqual([
        ...successResponse.value.listaEsitoRichiestaPerAnno.map(b => ({
          year: b.annoRiferimento,
          outcome: b.esitoRichiesta
        }))
      ]);
    }
  });
  it("should return kind success and as value the list of input year with the status if there aren't years with status not OK or with residence abroad", () => {
    const response = testableFunctions.convertSuccess!(
      totallySuccessResponse.value,
      []
    );

    expect(response.kind).toBe("success");
    if (response.kind === "success") {
      expect(response.value).toStrictEqual([
        ...totallySuccessResponse.value.listaEsitoRichiestaPerAnno.map(b => ({
          year: b.annoRiferimento,
          outcome: b.esitoRichiesta
        }))
      ]);
    }
  });
  it("should return kind genericError if there all the years have a status different from OK or have the residence abroad", () => {
    const response = testableFunctions.convertSuccess!(
      totallyWrongResponse.value,
      mockSelectedBonusesResidenceAbroad
    );

    expect(response.kind).toBe("genericError");
  });
});
