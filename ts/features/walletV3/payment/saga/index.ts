import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PaymentClient } from "../api/client";
import { walletGetPaymentDetails } from "../store/actions";
import { handleWalletGetPaymentDetails } from "./handleWalletGetPaymentDetails";

/**
 * Handle the pagoPA payments requests
 * @param bearerToken
 */
export function* watchWalletPaymentsSaga(
  paymentClient: PaymentClient
): SagaIterator {
  yield* takeLatest(
    walletGetPaymentDetails.request,
    handleWalletGetPaymentDetails,
    paymentClient.getPaymentRequestInfo
  );
}
