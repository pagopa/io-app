import { SagaIterator } from "redux-saga";
import { put, select, takeLatest } from "typed-redux-saga/macro";
import { identificationSuccess } from "../../../identification/store/actions";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../store/actions/securePreferences";

/**
 * Handles the offline access counter reset by listening for the wallet
 * instance status store success actions.
 *
 * The offline access counter is reset when the wallet instance status is updated
 * successfully, indicating that the user has returned online and the wallet instance
 * stattus is refreshed.
 */
export function* handleItwOfflineAccessCounterReset(): SagaIterator {
  yield* put(itwOfflineAccessCounterReset());
}

/**
 * Handles the increment of the offline access counter when the
 * offline wallet mini app is used.
 *
 * Th offline access counter is increased when the user completes with success
 * the biometrix/pin identification AND the offline mini app is used
 */
export function* handleItwOfflineAccessCounterUp(): SagaIterator {
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);
  if (offlineAccessReason !== undefined) {
    yield* put(itwOfflineAccessCounterUp());
  }
}

/**
 * Watch actions that trigger the offline access counter reset or increment.
 */
export function* watchItwOfflineAccess(): SagaIterator {
  yield* takeLatest(
    itwUpdateWalletInstanceStatus.success,
    handleItwOfflineAccessCounterReset
  );
  yield* takeLatest(identificationSuccess, handleItwOfflineAccessCounterUp);
}
