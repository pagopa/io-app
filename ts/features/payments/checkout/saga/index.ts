import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PaymentClient } from "../../common/api/client";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsDeleteTransactionAction,
  paymentsGetNewSessionTokenAction,
  paymentsGetPaymentDetailsAction,
  paymentsGetPaymentMethodsAction,
  paymentsGetPaymentTransactionInfoAction,
  paymentsGetPaymentUserMethodsAction,
  paymentsStartPaymentAuthorizationAction
} from "../store/actions/networking";
import { handleWalletPaymentAuthorization } from "./networking/handleWalletPaymentAuthorization";
import { handleWalletPaymentCalculateFees } from "./networking/handleWalletPaymentCalculateFees";
import { handleWalletPaymentCreateTransaction } from "./networking/handleWalletPaymentCreateTransaction";
import { handleWalletPaymentDeleteTransaction } from "./networking/handleWalletPaymentDeleteTransaction";
import { handleWalletPaymentGetAllMethods } from "./networking/handleWalletPaymentGetAllMethods";
import { handleWalletPaymentGetDetails } from "./networking/handleWalletPaymentGetDetails";
import { handleWalletPaymentGetTransactionInfo } from "./networking/handleWalletPaymentGetTransactionInfo";
import { handleWalletPaymentGetUserWallets } from "./networking/handleWalletPaymentGetUserWallets";
import { handleWalletPaymentNewSessionToken } from "./networking/handleWalletPaymentNewSessionToken";

/**
 * Handle the pagoPA payments requests
 * @param bearerToken
 */
export function* watchPaymentsCheckoutSaga(
  paymentClient: PaymentClient
): SagaIterator {
  yield* takeLatest(
    paymentsGetNewSessionTokenAction.request,
    handleWalletPaymentNewSessionToken,
    paymentClient.newSessionToken
  );

  yield* takeLatest(
    paymentsGetPaymentDetailsAction.request,
    handleWalletPaymentGetDetails,
    paymentClient.getPaymentRequestInfo
  );

  yield* takeLatest(
    paymentsGetPaymentMethodsAction.request,
    handleWalletPaymentGetAllMethods,
    paymentClient.getAllPaymentMethods
  );

  yield* takeLatest(
    paymentsGetPaymentUserMethodsAction.request,
    handleWalletPaymentGetUserWallets,
    paymentClient.getWalletsByIdUser
  );

  yield* takeLatest(
    paymentsCalculatePaymentFeesAction.request,
    handleWalletPaymentCalculateFees,
    paymentClient.calculateFees
  );

  yield* takeLatest(
    paymentsCreateTransactionAction.request,
    handleWalletPaymentCreateTransaction,
    paymentClient.newTransaction
  );

  yield* takeLatest(
    paymentsGetPaymentTransactionInfoAction.request,
    handleWalletPaymentGetTransactionInfo,
    paymentClient.getTransactionInfo
  );

  yield* takeLatest(
    paymentsDeleteTransactionAction.request,
    handleWalletPaymentDeleteTransaction,
    paymentClient.requestTransactionUserCancellation
  );

  yield* takeLatest(
    paymentsStartPaymentAuthorizationAction.request,
    handleWalletPaymentAuthorization,
    paymentClient.requestTransactionAuthorization
  );
}
