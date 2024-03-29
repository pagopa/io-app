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
import { paymentsCreateTransactionAction } from "../../../store/actions/networking";
import { handleWalletPaymentCreateTransaction } from "../handleWalletPaymentCreateTransaction";
import { selectWalletPaymentSessionToken } from "../../../store/selectors";

describe("Test handleWalletPaymentCreateTransaction saga", () => {
  const newTransactionPayload: NewTransactionRequest = {
    paymentNotices: [
      {
        rptId: "1234" as RptId,
        amount: 1234 as PaymentInfo["amount"]
      }
    ]
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
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockNewTransaction(),
        paymentsCreateTransactionAction.request(newTransactionPayload)
      )
      .next(E.right({ status: 200, value: newTransactionResponse }))
      .put(paymentsCreateTransactionAction.success(newTransactionResponse))
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
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockNewTransaction(),
        paymentsCreateTransactionAction.request(newTransactionPayload)
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        paymentsCreateTransactionAction.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
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
      .select(selectWalletPaymentSessionToken)
      .next(T_SESSION_TOKEN)
      .call(
        withRefreshApiCall,
        mockNewTransaction(),
        paymentsCreateTransactionAction.request(newTransactionPayload)
      )
      .next(E.left([]))
      .put(
        paymentsCreateTransactionAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
