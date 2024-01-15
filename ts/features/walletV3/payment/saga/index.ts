import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { WalletClient } from "../../common/api/client";
import { PaymentClient } from "../api/client";
import {
  walletPaymentAuthorization,
  walletPaymentCalculateFees,
  walletPaymentCreateTransaction,
  walletPaymentDeleteTransaction,
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetUserWallets
} from "../store/actions/networking";
import { handleWalletPaymentCalculateFees } from "./networking/handleWalletPaymentCalculateFees";
import { handleWalletPaymentCreateTransaction } from "./networking/handleWalletPaymentCreateTransaction";
import { handleWalletPaymentGetAllMethods } from "./networking/handleWalletPaymentGetAllMethods";
import { handleWalletPaymentGetDetails } from "./networking/handleWalletPaymentGetDetails";
import { handleWalletPaymentGetUserWallets } from "./networking/handleWalletPaymentGetUserWallets";
import { handleWalletPaymentAuthorization } from "./networking/handleWalletPaymentAuthorization";
import { handleWalletPaymentDeleteTransaction } from "./networking/handleWalletPaymentDeleteTransaction";

/**
 * Handle the pagoPA payments requests
 * @param bearerToken
 */
export function* watchWalletPaymentSaga(
  walletClient: WalletClient,
  paymentClient: PaymentClient
): SagaIterator {
  yield* takeLatest(
    walletPaymentGetDetails.request,
    handleWalletPaymentGetDetails,
    paymentClient.getPaymentRequestInfo
  );

  yield* takeLatest(
    walletPaymentGetAllMethods.request,
    handleWalletPaymentGetAllMethods,
    walletClient.getAllPaymentMethods
  );

  yield* takeLatest(
    walletPaymentGetUserWallets.request,
    handleWalletPaymentGetUserWallets,
    walletClient.getWalletsByIdUser
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
