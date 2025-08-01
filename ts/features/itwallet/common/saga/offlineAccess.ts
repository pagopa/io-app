import { fork, put, select, takeLatest } from "typed-redux-saga/macro";
import { identificationSuccess } from "../../../identification/store/actions";
import { progressSelector as identificationStatusSelector } from "../../../identification/store/selectors";
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
function* handleItwOfflineAccessCounterReset() {
  yield* put(itwOfflineAccessCounterReset());
}

/**
 * Handles the increment of the offline access counter when the app start in
 * offline mode
 */
function* handleItwOfflineAccessCounterUpOnIdentificationSuccess() {
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);
  if (offlineAccessReason !== undefined) {
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
) {
  if (action.payload !== OfflineAccessReasonEnum.DEVICE_OFFLINE) {
    // SESSION_REFRESH reason is dispatched after the user identification
    // SESSION_EXPIRED reason is dispatched without an user identification
    yield* put(itwOfflineAccessCounterUp());
  }
}

/**
 * Handles the increment of the offline access counter when the app start in
 * offline mode
 */
export function* handleItwOfflineAccessCounterUp() {
  // Get the current identification status to determine if the user has already completed
  // the identification.
  const identificationStatus = yield* select(identificationStatusSelector);

  // If the user already completed the identification successfully
  // call the increment function directly.
  if (identificationStatus.kind === "identified") {
    yield* handleItwOfflineAccessCounterUpOnIdentificationSuccess();
  }

  // Otherwise, wait for the identification success to be dispatched.
  yield* takeLatest(
    identificationSuccess,
    handleItwOfflineAccessCounterUpOnIdentificationSuccess
  );
  // or wait for the offline access reason to be set.
  yield* takeLatest(
    setOfflineAccessReason,
    handleItwOfflineAccessCounterUpOnReasonSet
  );
}

/**
 * Watch actions that trigger the offline access counter reset or increment.
 */
export function* watchItwOfflineAccess() {
  yield* takeLatest(
    itwUpdateWalletInstanceStatus.success,
    handleItwOfflineAccessCounterReset
  );

  yield* fork(handleItwOfflineAccessCounterUp);
}
