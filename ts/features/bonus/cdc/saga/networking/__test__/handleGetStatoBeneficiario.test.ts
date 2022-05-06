import { testSaga } from "redux-saga-test-plan";
import { left, right } from "fp-ts/lib/Either";
import {
  handleGetStatoBeneficiario,
  testableFunctions
} from "../handleGetStatoBeneficiario";
import { cdcRequestBonusList } from "../../../store/actions/cdcBonusRequest";
import { StatoBeneficiarioEnum } from "../../../../../../../definitions/cdc/StatoBeneficiario";
import { ListaStatoPerAnno } from "../../../../../../../definitions/cdc/ListaStatoPerAnno";
import { Anno } from "../../../../../../../definitions/cdc/Anno";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";

const successResponse = {
  status: 200,
  value: {
    listaStatoPerAnno: [
      {
        statoBeneficiario: StatoBeneficiarioEnum.VALUTAZIONE,
        annoRiferimento: "2021" as Anno
      }
    ]
  } as ListaStatoPerAnno
};

const failureResponse = {
  status: 401
};

describe("handleGetStatoBeneficiario", () => {
  const mockBackendCdcClient = jest.fn();
  it("Should dispatch cdcRequestBonusList.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handleGetStatoBeneficiario,
      mockBackendCdcClient,
      cdcRequestBonusList.request()
    )
      .next()
      .call(mockBackendCdcClient, {})
      .next(right(successResponse))
      .put(
        cdcRequestBonusList.success(
          testableFunctions.convertSuccess!(successResponse.value)
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcRequestBonusList.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(
      handleGetStatoBeneficiario,
      mockBackendCdcClient,
      cdcRequestBonusList.request()
    )
      .next()
      .call(mockBackendCdcClient, {})
      .next(right(failureResponse))
      .put(
        cdcRequestBonusList.failure(
          getGenericError(new Error(failureResponse.status.toString()))
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcRequestBonusList.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handleGetStatoBeneficiario,
      mockBackendCdcClient,
      cdcRequestBonusList.request()
    )
      .next()
      .call(mockBackendCdcClient, {})
      .next(left(new Error()))
      .put(
        cdcRequestBonusList.failure(
          getGenericError(
            new Error("Invalid payload from getStatoBeneficiario")
          )
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch cdcRequestBonusList.failure with the error message as payload if an exception is raised", () => {
    const mockedError = new Error("mockedErrorMessage");
    testSaga(
      handleGetStatoBeneficiario,
      mockBackendCdcClient,
      cdcRequestBonusList.request()
    )
      .next()
      .call(mockBackendCdcClient, {})
      .throw(mockedError)
      .put(cdcRequestBonusList.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
