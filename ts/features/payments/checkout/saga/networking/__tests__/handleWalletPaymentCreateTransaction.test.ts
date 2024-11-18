import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { NewTransactionResponse } from "../../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentInfo } from "../../../../../../../definitions/pagopa/ecommerce/PaymentInfo";
import { RptId } from "../../../../../../../definitions/pagopa/ecommerce/RptId";
import { TransactionStatusEnum } from "../../../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import {
  paymentsCreateTransactionAction,
  WalletPaymentCreateTransactionPayload
} from "../../../store/actions/networking";
import { handleWalletPaymentCreateTransaction } from "../handleWalletPaymentCreateTransaction";

describe("Test handleWalletPaymentCreateTransaction saga", () => {
  const newTransactionPayload: WalletPaymentCreateTransactionPayload = {
    data: {
      paymentNotices: [
        {
          rptId: "1234" as RptId,
          amount: 1234 as PaymentInfo["amount"]
        }
      ]
    }
  };
  const T_SESSION_TOKEN = "ABCD";

  it(`should put ${getType(
    paymentsCreateTransactionAction.success
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
      paymentsCreateTransactionAction.request(newTransactionPayload)
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: newTransactionResponse }))
      .next()
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsCreateTransactionAction.failure
  )} when newTransaction is not 200`, () => {
    const mockNewTransaction = jest.fn();

    testSaga(
      handleWalletPaymentCreateTransaction,
      mockNewTransaction,
      paymentsCreateTransactionAction.request(newTransactionPayload)
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 400, value: undefined }))
      .next({})
      .next()
      .isDone();
  });

  it(`should put ${getType(
    paymentsCreateTransactionAction.failure
  )} when newTransaction encoders returns an error`, () => {
    const mockNewTransaction = jest.fn();

    testSaga(
      handleWalletPaymentCreateTransaction,
      mockNewTransaction,
      paymentsCreateTransactionAction.request(newTransactionPayload)
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .next({})
      .next()
      .isDone();
  });
});
