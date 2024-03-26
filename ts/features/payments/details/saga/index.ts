import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { WalletClient } from "../../common/api/client";
import {
  walletDetailsDeleteInstrument,
  walletDetailsGetInstrument,
  walletDetailsPagoPaCapabilityToggle
} from "../store/actions";
import { handleGetWalletDetails } from "./handleGetWalletDetails";
import { handleDeleteWalletDetails } from "./handleDeleteWalletDetails";
import { handleTogglePagoPaCapability } from "./handleTogglePagoPaCapability";

/**
 * Handle Wallet onboarding requests
 * @param bearerToken
 */
export function* watchWalletDetailsSaga(
  walletClient: WalletClient
): SagaIterator {
  // handle the request of get wallet details
  yield* takeLatest(
    walletDetailsGetInstrument.request,
    handleGetWalletDetails,
    walletClient.getWalletById
  );

  // handle the request of delete a wallet
  yield* takeLatest(
    walletDetailsDeleteInstrument.request,
    handleDeleteWalletDetails,
    walletClient.deleteWalletById
  );

  // handle request to a wallet
  yield* takeLatest(
    walletDetailsPagoPaCapabilityToggle.request,
    handleTogglePagoPaCapability,
    walletClient.updateWalletApplicationsById
  );
}
