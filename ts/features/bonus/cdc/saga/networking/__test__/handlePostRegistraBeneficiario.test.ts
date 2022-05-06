import { testSaga } from "redux-saga-test-plan";
import { left, right } from "fp-ts/lib/Either";
import { cdcEnrollUserToBonus } from "../../../store/actions/cdcBonusRequest";
import {
  handlePostRegistraBeneficiario,
  testableFunctions
} from "../handlePostRegistraBeneficiario";
import { CdcBonusEnrollmentList } from "../../../types/CdcBonusRequest";
import { Anno } from "../../../../../../../definitions/cdc/Anno";
import { ListaEsitoRichiestaPerAnno } from "../../../../../../../definitions/cdc/ListaEsitoRichiestaPerAnno";
import { EsitoRichiestaEnum } from "../../../../../../../definitions/cdc/EsitoRichiesta";
import { RichiestaCartaErrata } from "../../../../../../../definitions/cdc/RichiestaCartaErrata";
import { RichiestaCartaErrataMotivoEnum } from "../../../../../../../definitions/cdc/RichiestaCartaErrataMotivo";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";

const enrollmentList: CdcBonusEnrollmentList = [
  { year: "2020" as Anno },
  { year: "2021" as Anno },
  { year: "2022" as Anno }
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
      cdcEnrollUserToBonus.request(enrollmentList)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(enrollmentList)
      )
      .next(right(successResponse))
      .put(
        cdcEnrollUserToBonus.success(
          testableFunctions.convertSuccess!(successResponse.value)
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcEnrollUserToBonus.failure with the status in the response payload if the response is right and the status code is 400", () => {
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(enrollmentList)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(enrollmentList)
      )
      .next(right(wrongRequestResponse))
      .put(
        cdcEnrollUserToBonus.failure(
          getGenericError(new Error(wrongRequestResponse.value.status))
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcEnrollUserToBonus.failure with the status code if the response is right and the status code is different from 200 and 400", () => {
    testSaga(
      handlePostRegistraBeneficiario,
      mockBackendCdcClient,
      cdcEnrollUserToBonus.request(enrollmentList)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(enrollmentList)
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
      cdcEnrollUserToBonus.request(enrollmentList)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(enrollmentList)
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
      cdcEnrollUserToBonus.request(enrollmentList)
    )
      .next()
      .call(
        mockBackendCdcClient,
        testableFunctions.convertRequestPayload!(enrollmentList)
      )
      .throw(mockedError)
      .put(cdcEnrollUserToBonus.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
