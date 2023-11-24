import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { WalletClient } from "../../common/api/client";
import { PaymentClient } from "../api/client";
import {
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetUserWallets
} from "../store/actions";
import { handleWalletPaymentGetAllMethods } from "./handleWalletPaymentGetAllMethods";
import { handleWalletPaymentGetDetails } from "./handleWalletPaymentGetDetails";
import { handleWalletPaymentGetUserWallets } from "./handleWalletPaymentGetUserWallets";

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
}
