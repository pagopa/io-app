import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { NewTransactionRequest } from "../../../../../../../definitions/pagopa/ecommerce/NewTransactionRequest";
import { NewTransactionResponse } from "../../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentInfo } from "../../../../../../../definitions/pagopa/ecommerce/PaymentInfo";
import { RptId } from "../../../../../../../definitions/pagopa/ecommerce/RptId";
import { TransactionStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import { walletPaymentCreateTransaction } from "../../../store/actions/networking";
import { handleWalletPaymentCreateTransaction } from "../handleWalletPaymentCreateTransaction";

describe("Test handleWalletPaymentCreateTransaction saga", () => {
  const newTransactionPayload: NewTransactionRequest = {
    paymentNotices: [
      {
        rptId: "1234" as RptId,
        amount: 1234 as PaymentInfo["amount"]
      }
    ]
  };

  it(`should put ${getType(
    walletPaymentCreateTransaction.success
  )} when newTransaction is 200`, () => {
    const mockNewTransaction = jest.fn();
    const newTransactionResponse: NewTransactionResponse = {
      payments: [
        {
          rptId: "1234" as RptId,
          amount: 1234 as PaymentInfo["amount"]
        }
      ],
      status: TransactionStatusEnum.ACTIVATED,
      transactionId: "1234"
    };

    testSaga(
      handleWalletPaymentCreateTransaction,
      mockNewTransaction,
      walletPaymentCreateTransaction.request(newTransactionPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockNewTransaction(),
        walletPaymentCreateTransaction.request(newTransactionPayload)
      )
      .next(E.right({ status: 200, value: newTransactionResponse }))
      .put(walletPaymentCreateTransaction.success(newTransactionResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentCreateTransaction.failure
  )} when newTransaction is not 200`, () => {
    const mockNewTransaction = jest.fn();

    testSaga(
      handleWalletPaymentCreateTransaction,
      mockNewTransaction,
      walletPaymentCreateTransaction.request(newTransactionPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockNewTransaction(),
        walletPaymentCreateTransaction.request(newTransactionPayload)
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        walletPaymentCreateTransaction.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentCreateTransaction.failure
  )} when newTransaction encoders returns an error`, () => {
    const mockNewTransaction = jest.fn();

    testSaga(
      handleWalletPaymentCreateTransaction,
      mockNewTransaction,
      walletPaymentCreateTransaction.request(newTransactionPayload)
    )
      .next()
      .call(
        withRefreshApiCall,
        mockNewTransaction(),
        walletPaymentCreateTransaction.request(newTransactionPayload)
      )
      .next(E.left([]))
      .put(
        walletPaymentCreateTransaction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
