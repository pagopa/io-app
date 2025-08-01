import { put, takeLatest } from "typed-redux-saga/macro";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import { itwOfflineAccessCounterReset } from "../store/actions/securePreferences";

/**
 * Handles the offline access counter reset by listening for the wallet
 * instance status store success actions.
 *
 * The offline access counter is reset when the wallet instance status is updated
 * successfully, indicating that the user has returned online and the wallet instance
 * stattus is refreshed.
 */
function* handleItwOfflineAccessCounterReset() {
  yield* put(itwOfflineAccessCounterReset());
}

/**
 * Watch actions that trigger the offline access counter reset.
 */
export function* watchItwOfflineAccess() {
  yield* takeLatest(
    itwUpdateWalletInstanceStatus.success,
    handleItwOfflineAccessCounterReset
  );
}
