import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import {
  StatusEnum,
  TransactionBarCodeResponse
} from "../../../../../../definitions/idpay/TransactionBarCodeResponse";
import {
  CodeEnum,
  TransactionErrorDTO
} from "../../../../../../definitions/idpay/TransactionErrorDTO";
import { getNetworkError } from "../../../../../utils/errors";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { mockIDPayClient } from "../../../common/api/__mocks__/client";
import { idPayGenerateBarcode } from "../../store/actions";
import { handleGenerateBarcode } from "../handleGenerateBarcode";

describe("handleGenerateBarcode test", () => {
  const initiativeId = "abcdef";
  const mock201 = {
    id: "123456",
    trxCode: "123456",
    initiativeId: "abcdef",
    status: StatusEnum.CREATED,
    trxDate: new Date(),
    initiativeName: "initiativeName",
    residualBudgetCents: 1000,
    trxExpirationSeconds: 1000
  } as TransactionBarCodeResponse;

  const mockError: TransactionErrorDTO = {
    code: CodeEnum.PAYMENT_GENERIC_ERROR,
    message: "error"
  };

  it(`should put ${getType(
    idPayGenerateBarcode.success
  )} when createBarCodeTransactionRequest is 201`, () => {
    testSaga(
      handleGenerateBarcode,
      mockIDPayClient.createBarCodeTransaction,
      "bpdtoken",
      idPayGenerateBarcode.request({ initiativeId })
    )
      .next()
      .call(
        withRefreshApiCall,
        mockIDPayClient.createBarCodeTransaction({
          bearerAuth: "token",
          body: { initiativeId }
        }),
        idPayGenerateBarcode.request({ initiativeId })
      )
      .next(E.right({ status: 201, value: mock201 }))
      .put(idPayGenerateBarcode.success(mock201))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    idPayGenerateBarcode.failure
  )} when createBarCodeTransactionRequest is not 201`, () => {
    testSaga(
      handleGenerateBarcode,
      mockIDPayClient.createBarCodeTransaction,
      "bpdtoken",
      idPayGenerateBarcode.request({ initiativeId })
    )
      .next()
      .call(
        withRefreshApiCall,
        mockIDPayClient.createBarCodeTransaction({
          bearerAuth: "token",
          body: { initiativeId }
        }),
        idPayGenerateBarcode.request({ initiativeId })
      )
      .next(E.right({ status: 401, value: mockError }))
      .put(
        idPayGenerateBarcode.failure({
          initiativeId,
          error: mockError
        })
      )
      .next()
      .isDone();
  });
  it(`should put ${getType(
    idPayGenerateBarcode.failure
  )} with a generic error when the decoding fails`, () => {
    testSaga(
      handleGenerateBarcode,
      mockIDPayClient.createBarCodeTransaction,
      "bpdtoken",
      idPayGenerateBarcode.request({ initiativeId })
    )
      .next()
      .call(
        withRefreshApiCall,
        mockIDPayClient.createBarCodeTransaction({
          bearerAuth: "token",
          body: { initiativeId }
        }),
        idPayGenerateBarcode.request({ initiativeId })
      )
      .next(E.left([]))
      .put(
        idPayGenerateBarcode.failure({
          initiativeId,
          error: mockError
        })
      )
      .next()
      .isDone();
  });
  it(`should put ${getType(
    idPayGenerateBarcode.failure
  )} with a generic error when the fetch fails`, () => {
    testSaga(
      handleGenerateBarcode,
      mockIDPayClient.createBarCodeTransaction,
      "bpdtoken",
      idPayGenerateBarcode.request({ initiativeId })
    )
      .next()
      .call(
        withRefreshApiCall,
        mockIDPayClient.createBarCodeTransaction({
          bearerAuth: "token",
          body: { initiativeId }
        }),
        idPayGenerateBarcode.request({ initiativeId })
      )
      .throw(new Error("testing throw"))
      .put(
        idPayGenerateBarcode.failure({
          initiativeId,
          error: getNetworkError(new Error("testing throw"))
        })
      )
      .next()
      .isDone();
  });
});
