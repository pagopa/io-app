import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { WalletClient } from "../../common/api/client";
import { PaymentClient } from "../api/client";
import {
  walletPaymentCalculateFees,
  walletPaymentCreateTransaction,
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetUserWallets
} from "../store/actions";
import { handleWalletPaymentGetAllMethods } from "./handleWalletPaymentGetAllMethods";
import { handleWalletPaymentGetDetails } from "./handleWalletPaymentGetDetails";
import { handleWalletPaymentGetUserWallets } from "./handleWalletPaymentGetUserWallets";
import { handleWalletPaymentCalculateFees } from "./handleWalletPaymentCalculateFees";
import { handleWalletPaymentCreateTransaction } from "./handleWalletPaymentCreateTransaction";

/**
 * Handle the pagoPA payments requests
 * @param bearerToken
 */
export function* watchWalletPaymentsSaga(
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
}
