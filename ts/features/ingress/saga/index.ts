import { put, select, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { setOfflineAccessReason } from "../store/actions";
import { itwLifecycleIsOperationalOrValid } from "../../itwallet/lifecycle/store/selectors";
import { isItwOfflineAccessEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { offlineAccessReasonSelector } from "../store/selectors";
import { OfflineAccessReasonEnum } from "../store/reducer";
import { startupLoadSuccess } from "../../../store/actions/startup";
import { StartupStatusEnum } from "../../../store/reducers/startup";
import { isConnectedSelector } from "../../connectivity/store/selectors";

/**
 * Handles the transition to offline mode during startup.
 *
 * This saga checks whether:
 * - The user has a valid IT Wallet instance (`itwLifecycleIsOperationalOrValid`)
 * - Offline access is enabled (`isItwOfflineAccessEnabledSelector`)
 * - The offline access reason is due to a session refresh (`OfflineAccessReasonEnum.SESSION_REFRESH`)
 *
 * If all conditions are met, it updates the startup status to `OFFLINE`.
 */
export function* evaluateOfflineSessionRefreshSaga() {
  const selectItwLifecycleIsOperationalOrValid = yield* select(
    itwLifecycleIsOperationalOrValid
  );
  const isOfflineAccessEnabled = yield* select(
    isItwOfflineAccessEnabledSelector
  );
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);

  if (
    selectItwLifecycleIsOperationalOrValid &&
    isOfflineAccessEnabled &&
    offlineAccessReason === OfflineAccessReasonEnum.SESSION_REFRESH
  ) {
    yield* put(startupLoadSuccess(StartupStatusEnum.OFFLINE));
  }
}

/**
 * Watches for `setOfflineAccessReason` action.
 *
 * When triggered, it runs `evaluateOfflineSessionRefreshSaga` to determine if the app
 * should transition to offline mode based on the updated offline access reason.
 */
export function* watchSessionRefreshInOfflineSaga() {
  yield* takeLatest(
    getType(setOfflineAccessReason),
    evaluateOfflineSessionRefreshSaga
  );
}

/**
 * Determines if the device is offline and offline access is available.
 *
 * This saga checks whether:
 * - The device is offline (`isConnectedSelector` is `false`)
 * - The user has a valid IT Wallet instance (`itwLifecycleIsOperationalOrValid`)
 * - The local feature flag for offline access is enabled (`isItwOfflineAccessEnabledSelector`)
 *
 * @returns {boolean} - Returns `true` if offline access is available and the device is offline, otherwise `false`.
 */
export function* isDeviceOfflineWithWalletSaga() {
  const isConnected = yield* select(isConnectedSelector);
  const selectItwLifecycleIsOperationalOrValid = yield* select(
    itwLifecycleIsOperationalOrValid
  );
  const isItwOfflineAccessEnabled = yield* select(
    isItwOfflineAccessEnabledSelector
  );

  if (
    !isConnected &&
    selectItwLifecycleIsOperationalOrValid &&
    isItwOfflineAccessEnabled
  ) {
    return true;
  }
  return false;
}
