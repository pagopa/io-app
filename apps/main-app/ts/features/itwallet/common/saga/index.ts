import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { SagaIterator } from "redux-saga";
import {
  call,
  fork,
  put,
  select,
  take,
  takeLatest
} from "typed-redux-saga/macro";
import { Action, ActionType, isActionOf } from "typesafe-actions";

import { setConnectionStatus } from "../../../connectivity/store/actions";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { setOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import {
  syncItwAnalyticsProperties,
  updateNfcInfoTrackingProperties,
  watchItwAnalyticsSaga
} from "../../analytics/saga";
import { watchItwCredentialsSaga } from "../../credentials/saga";
import { checkCredentialsBatchRefill } from "../../credentials/saga/checkCredentialsBatchRefill";
import { checkCredentialsStatusAssertion } from "../../credentials/saga/checkCredentialsStatusAssertion";
import { handleItwCredentialsVaultCoherenceSaga } from "../../credentials/saga/handleItwCredentialsVaultCoherenceSaga";
import { handleItwCredentialsVaultMigrationSaga } from "../../credentials/saga/handleItwCredentialsVaultMigrationSaga";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { handleWalletUnitAttestationsCleanUp } from "../../credentials/saga/handleWalletUnitAttestationsCleanUp";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors/index";
import { watchItwCredentialsCatalogueSaga } from "../../credentialsCatalogue/saga/index";
import { checkHasNfcFeatureSaga } from "../../identification/common/saga/index";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { checkCurrentWalletInstanceStateSaga } from "../../lifecycle/saga/checkCurrentWalletInstanceStateSaga";
import { warmUpIntegrityServiceSaga } from "../../lifecycle/saga/checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceInconsistencySaga,
  checkWalletInstanceStateOfflineSaga,
  checkWalletInstanceStateSaga
} from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import {
  watchItwStatusListAuthenticatedSaga,
  watchItwStatusListSaga
} from "../../statusList/saga";
import { checkFiscalCodeEnabledSaga } from "../../trialSystem/saga/checkFiscalCodeIsEnabledSaga";
import {
  itwSetAuthLevel,
  itwSetFiscalCodeWhitelisted
} from "../store/actions/preferences";
import { isItwCredential } from "../utils/itwCredentialUtils";
import { watchItwEnvironment } from "./environment";
import { watchItwOfflineAccess } from "./offlineAccess";

/**
 * Watcher for ITW sagas that require internet connection and a valid session
 */
export function* watchItwAuthenticatedSaga(): SagaIterator {
  yield* takeLatest(
    itwSetFiscalCodeWhitelisted,
    handleAuthLevelSanitizationSaga
  );
  // Watch for changes in the ITW lifecycle to keep the wallet in sync
  yield* fork(watchItwLifecycleSaga);
  // Fetch and process the Digital Credentials Catalogue
  yield* fork(watchItwCredentialsCatalogueSaga);
  // Check if the fiscal code is enabled, to enable the L3
  yield* fork(checkFiscalCodeEnabledSaga);
  // Watch ITW analytics lifecycle (initial sync and reactive updates)
  yield* fork(watchItwAnalyticsSaga);
  // Registers and watches backgroundtasks
  yield* fork(watchItwStatusListAuthenticatedSaga);

  const isWalletInstanceConsistent = yield* call(
    checkWalletInstanceInconsistencySaga
  );

  // If the wallet instance is inconsistent, we cannot proceed further.
  if (!isWalletInstanceConsistent) {
    return;
  }

  // Status assertions of credentials are checked only in case of a valid wallet instance.
  // For this reason, these sagas must be called sequentially.
  yield* call(checkWalletInstanceStateSaga);
  yield* call(checkCurrentWalletInstanceStateSaga);
  yield* call(checkCredentialsStatusAssertion);
  // Silently renew the batches of one-time-use credentials that dropped under threshold.
  // It requires a valid session and network access, hence it belongs to the authenticated watcher.
  yield* call(checkCredentialsBatchRefill);
}

/**
 * Waits for device-offline access, then checks the valid Wallet Instance against
 * its cached Status List without making network requests.
 */
export function* watchItwOfflineSaga(): SagaIterator {
  // Checks for offline signal before running offline-only sagas
  yield* waitForOffline();

  yield* call(checkWalletInstanceStateOfflineSaga);
}

/**
 * Watcher for ITW sagas that do not require internet connection or a valid session
 */
export function* watchItwSaga(): SagaIterator {
  // Handle offline access counter increment and reset
  yield* fork(watchItwOfflineAccess);
  // Check the Wallet Instance from its cached Status List when offline.
  yield* fork(watchItwOfflineSaga);
  // Handle environment changes
  yield* fork(watchItwEnvironment);
  // Watch for changes in the credentials store to keep the wallet in sync
  yield* fork(watchItwCredentialsSaga);
  // Check if the device has the NFC Feature
  yield* fork(checkHasNfcFeatureSaga);
  // Migrate legacy credentials to vault
  yield* call(handleItwCredentialsVaultMigrationSaga);
  // Ensure Redux and CredentialsVault are coherent
  yield* call(handleItwCredentialsVaultCoherenceSaga);
  // Rehydrate wallet cards from Redux credentials store
  yield* fork(handleWalletCredentialsRehydration);
  // Clean up stale Wallet Unit Attestations
  yield* fork(handleWalletUnitAttestationsCleanUp);
  // TODO remove this fork when NFC antenna info tracking is not needed anymore
  yield* fork(updateNfcInfoTrackingProperties);
  // Sync ITW analytics properties
  yield* fork(syncItwAnalyticsProperties);

  // Checks for internet connection before running sagas that require it
  yield* waitForConnection();

  // Warmup the integrity service to ensure it's ready for subsequent operations
  yield* fork(warmUpIntegrityServiceSaga);
  // Run Status List check and refresh sagas
  yield* call(watchItwStatusListSaga);
}

/**
 * Sanitizes the authentication level to fix an inconsistency introduced by a regression in app version 3.21.
 *
 * This saga ensures that users with an L3 PID credential (assurance_level = high) have their
 * `auth_level` correctly set to 'L3'.
 *
 * The sanitization is skipped for whitelisted users (when `action.payload` is `true`).
 *
 * @param action - The action dispatched when the fiscal code whitelist status changes.
 *
 * TODO: This check can be safely removed once the minimum supported app version is greater than 3.21
 */
const handleAuthLevelSanitizationSaga = function* (
  action: ActionType<typeof itwSetFiscalCodeWhitelisted>
): SagaIterator {
  if (action.payload) {
    // Skip the sanitization for whitelisted users
    return;
  }

  // Check whether the user has an IT-Wallet PID credential
  const hasItwPID = pipe(
    yield* select(itwCredentialsEidSelector),
    O.map(isItwCredential),
    O.getOrElse(() => false)
  );

  if (!hasItwPID) {
    // No L3 PID found, no need to sanitize
    return;
  }

  yield* put(itwSetAuthLevel("L3"));
};

/**
 * Waits for an internet connection to be established before proceeding.
 * If the app is already connected, it returns immediately.
 * Otherwise, it waits for a `setConnectionStatus` action with a payload of `true`.
 *
 * @returns A generator that yields until an internet connection is available.
 */
export function* waitForConnection() {
  const isConnected = yield* select(isConnectedSelector);

  if (isConnected) {
    return;
  }

  yield* take(
    (action: Action): action is ReturnType<typeof setConnectionStatus> =>
      isActionOf(setConnectionStatus, action) && action.payload === true
  );
}

/**
 * Waits for device-offline access before proceeding.
 * Returns immediately when the offline reason is already `DEVICE_OFFLINE`;
 * otherwise waits for `setOfflineAccessReason(DEVICE_OFFLINE)`.
 *
 * @returns A generator that yields until device-offline access is active.
 */
export function* waitForOffline() {
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);

  if (offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE) {
    return;
  }

  yield* take(
    (action: Action): action is ReturnType<typeof setOfflineAccessReason> =>
      isActionOf(setOfflineAccessReason, action) &&
      action.payload === OfflineAccessReasonEnum.DEVICE_OFFLINE
  );
}
