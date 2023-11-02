import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { WalletClient } from "../../common/api/client";
import { walletDetailsGetInstrument } from "../store/actions";
import { handleGetWalletDetails } from "./handleGetWalletDetails";

/**
 * Handle Wallet onboarding requests
 * @param bearerToken
 */
export function* watchWalletDetailsSaga(
  walletClient: WalletClient,
  token: string
): SagaIterator {
  // handle the request of get wallet details
  yield* takeLatest(
    walletDetailsGetInstrument.request,
    handleGetWalletDetails,
    walletClient.getWalletById,
    token
  );
}
