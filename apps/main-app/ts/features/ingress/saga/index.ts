import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { setOfflineAccessReason } from "../store/actions";
import { offlineAccessReasonSelector } from "../store/selectors";
import { OfflineAccessReasonEnum } from "../store/reducer";
import { startupLoadSuccess } from "../../../store/actions/startup";
import { StartupStatusEnum } from "../../../store/reducers/startup";
import { isConnectedSelector } from "../../connectivity/store/selectors";
import { setConnectionStatus } from "../../connectivity/store/actions";
import { itwOfflineAccessAvailableSelector } from "../../itwallet/common/store/selectors";

/**
 * Handles the transition to offline mode during startup.
 *
 * This saga checks whether:
 * - The user has a valid IT Wallet instance with credentials and offline access is enabled (`itwOfflineAccessAvailableSelector`)
 * - The offline access reason is due to a session refresh (`OfflineAccessReasonEnum.SESSION_REFRESH`)
 *
 * If all conditions are met, it updates the startup status to `OFFLINE`.
 */
export function* evaluateOfflineSessionRefreshSaga() {
  const itwOfflineAccessAvailable = yield* select(
    itwOfflineAccessAvailableSelector
  );
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);

  if (
    itwOfflineAccessAvailable &&
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
 * - The user has a valid IT Wallet instance with credentials and offline access is enabled (`itwOfflineAccessAvailableSelector`)
 *
 * @returns {boolean} - Returns `true` if offline access is available and the device is offline, otherwise `false`.
 */
export function* isDeviceOfflineWithWalletSaga() {
  // eslint-disable-next-line functional/no-let
  let isConnected = yield* select(isConnectedSelector);

  const itwOfflineAccessAvailable = yield* select(
    itwOfflineAccessAvailableSelector
  );

  if (isConnected === undefined) {
    const connectionStatus = yield* take(setConnectionStatus);
    isConnected = connectionStatus.payload;
  }

  if (isConnected === false && itwOfflineAccessAvailable) {
    return true;
  }
  return false;
}

/**
 * Prevents the saga from executing if the user opened the app while offline.
 *
 * - Calls `isDeviceOfflineWithWalletSaga` to determine if the device is offline,
 *   the user has a valid IT Wallet instance, and offline access is enabled.
 * - If this condition is met, it means the app started in offline mode,
 *   so the function exits early (`return`), preventing unnecessary execution of subsequent logic.
 * - This ensures that only relevant flows are triggered based on the app’s startup condition.
 * - Additionally, it checks if the offline access reason is due to a timeout (`OfflineAccessReasonEnum.TIMEOUT`).
 *   If so, it also exits early to avoid further processing.
 *
 * @returns {boolean} - Returns `true` if the saga should exit early due to offline access conditions, otherwise `false`.
 */ export function* shouldExitForOfflineAccess() {
  const isDeviceOfflineWithWallet = yield* call(isDeviceOfflineWithWalletSaga);

  if (isDeviceOfflineWithWallet) {
    return true;
  }
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);

  return offlineAccessReason === OfflineAccessReasonEnum.TIMEOUT;
}
