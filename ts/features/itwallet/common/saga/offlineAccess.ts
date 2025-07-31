import { SagaIterator } from "redux-saga";
import { put, select, takeLatest } from "typed-redux-saga/macro";
import { identificationSuccess } from "../../../identification/store/actions";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../store/actions/securePreferences";
import { setOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";

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
 * Handles the increment of the offline access counter when the app start in
 * offline mode and user completes the identification successfully.
 */
export function* handleItwOfflineAccessCounterUpOnIdentificationSuccess(): SagaIterator {
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);
  if (offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE) {
    yield* put(itwOfflineAccessCounterUp());
  }
}

/**
 * Handles the increment of the offline access counter when:
 * - the user completes the identification successfully, but the session refresh fails.
 * - the user opens the app without a valid session and the app is in offline mode.
 *
 * This is required because in these cases the identification is made (or not made at all)
 * before the access  reason is set.
 */
export function* handleItwOfflineAccessCounterUpOnReasonSet(
  action: ReturnType<typeof setOfflineAccessReason>
): SagaIterator {
  if (action.payload !== OfflineAccessReasonEnum.DEVICE_OFFLINE) {
    // SESSION_REFRESH reason is dispatched after the user identification
    // SESSION_EXPIRED reason is dispatched without an user identification
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
  yield* takeLatest(
    identificationSuccess,
    handleItwOfflineAccessCounterUpOnIdentificationSuccess
  );
  yield* takeLatest(
    setOfflineAccessReason,
    handleItwOfflineAccessCounterUpOnReasonSet
  );
}
