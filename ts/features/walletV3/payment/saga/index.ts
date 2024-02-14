import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PaymentClient } from "../api/client";
import {
  walletPaymentAuthorization,
  walletPaymentCalculateFees,
  walletPaymentCreateTransaction,
  walletPaymentDeleteTransaction,
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetTransactionInfo,
  walletPaymentGetUserWallets,
  walletPaymentNewSessionToken
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
export function* watchWalletPaymentSaga(
  paymentClient: PaymentClient
): SagaIterator {
  yield* takeLatest(
    walletPaymentNewSessionToken.request,
    handleWalletPaymentNewSessionToken,
    paymentClient.newSessionToken
  );

  yield* takeLatest(
    walletPaymentGetDetails.request,
    handleWalletPaymentGetDetails,
    paymentClient.getPaymentRequestInfo
  );

  yield* takeLatest(
    walletPaymentGetAllMethods.request,
    handleWalletPaymentGetAllMethods,
    paymentClient.getAllPaymentMethods
  );

  yield* takeLatest(
    walletPaymentGetUserWallets.request,
    handleWalletPaymentGetUserWallets,
    paymentClient.getWalletsByIdUser
  );

  yield* takeLatest(
    walletPaymentCalculateFees.request,
    handleWalletPaymentCalculateFees,
    paymentClient.calculateFees
  );

  yield* takeLatest(
    walletPaymentCreateTransaction.request,
    handleWalletPaymentCreateTransaction,
    paymentClient.newTransaction
  );

  yield* takeLatest(
    walletPaymentGetTransactionInfo.request,
    handleWalletPaymentGetTransactionInfo,
    paymentClient.getTransactionInfo
  );

  yield* takeLatest(
    walletPaymentDeleteTransaction.request,
    handleWalletPaymentDeleteTransaction,
    paymentClient.requestTransactionUserCancellation
  );

  yield* takeLatest(
    walletPaymentAuthorization.request,
    handleWalletPaymentAuthorization,
    paymentClient.requestTransactionAuthorization
  );
}
