import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { WalletClient } from "../../common/api/client";
import { getPaymentsWalletUserMethods } from "../store/actions";
import { handleGetPaymentsWalletUserMethods } from "./handleGetPaymentsWalletUserMethods";

/**
 * Handle Wallet onboarding requests
 * @param bearerToken
 */
export function* watchPaymentsWalletSaga(
  walletClient: WalletClient
): SagaIterator {
  yield* takeLatest(
    getPaymentsWalletUserMethods.request,
    handleGetPaymentsWalletUserMethods,
    walletClient.getIOPaymentWalletsByIdUser
  );
}
