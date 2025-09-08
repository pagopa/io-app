import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { OperationDTO } from "../../../../../../definitions/idpay/OperationDTO";
import { StatusEnum } from "../../../../../../definitions/idpay/TransactionDetailDTO";
import { OperationTypeEnum as TransactionOperationType } from "../../../../../../definitions/idpay/TransactionOperationDTO";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idpayTimelineDetailsGet } from "../../store/actions";
import { handleGetTimelineDetails } from "../handleGetTimelineDetails";

const mockResponseSuccess = {
  operationType: TransactionOperationType.TRANSACTION,
  brand: "VISA",
  operationDate: new Date(),
  amountCents: 10034,
  brandLogo:
    "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
  circuitType: "01",
  maskedPan: "1234",
  operationId: "1",
  accruedCents: 100.0,
  idTrxAcquirer: "1",
  idTrxIssuer: "1",
  status: StatusEnum.AUTHORIZED
} as OperationDTO;

const mockPayload = { initiativeId: "123", operationId: "123" };

describe("idpayTimelineDetailsGet", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(
      idpayTimelineDetailsGet.success
    )} with the operation details`, () => {
      const getTimelineDetail = jest.fn();
      testSaga(
        handleGetTimelineDetails,
        getTimelineDetail,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idpayTimelineDetailsGet.request(mockPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          getTimelineDetail(mockPayload),
          idpayTimelineDetailsGet.request(mockPayload)
        )
        .next(E.right({ status: 200, value: mockResponseSuccess }))
        .put(idpayTimelineDetailsGet.success(mockResponseSuccess))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      idpayTimelineDetailsGet.failure
    )} with the error`, () => {
      const getTimelineDetail = jest.fn();
      testSaga(
        handleGetTimelineDetails,
        getTimelineDetail,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idpayTimelineDetailsGet.request(mockPayload)
      )
        .next()
        .call(
          withRefreshApiCall,
          getTimelineDetail(mockPayload),
          idpayTimelineDetailsGet.request(mockPayload)
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          idpayTimelineDetailsGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
