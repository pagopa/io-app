import { SagaIterator } from "redux-saga";
import { call, fork, select, take } from "typed-redux-saga/macro";
import { Action, isActionOf } from "typesafe-actions";

import { setConnectionStatus } from "../../../connectivity/store/actions";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
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
import { handleKeyAttestationsCleanUp } from "../../credentials/saga/handleKeyAttestationsCleanUp";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { watchItwCredentialsCatalogueSaga } from "../../credentialsCatalogue/saga/index";
import { checkHasNfcFeatureSaga } from "../../identification/common/saga/index";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { checkCurrentWalletInstanceStateSaga } from "../../lifecycle/saga/checkCurrentWalletInstanceStateSaga";
import { warmUpIntegrityServiceSaga } from "../../lifecycle/saga/checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceInconsistencySaga,
  checkWalletInstanceStateSaga
} from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import {
  watchItwStatusListAuthenticatedSaga,
  watchItwStatusListSaga
} from "../../statusList/saga";
import { checkFiscalCodeEnabledSaga } from "../../trialSystem/saga/checkFiscalCodeIsEnabledSaga";
import { watchItwEnvironment } from "./environment";
import { watchItwOfflineSaga } from "./offlineAccess";

/**
 * Waits for an internet connection to be established before proceeding. If the
 * app is already connected, it returns immediately. Otherwise, it waits for a
 * `setConnectionStatus` action with a payload of `true`.
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

/** Watcher for ITW sagas that require internet connection and a valid session */
export function* watchItwAuthenticatedSaga(): SagaIterator {
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
 * Watcher for ITW sagas that do not require internet connection or a valid
 * session
 */
export function* watchItwSaga(): SagaIterator {
  // Handle offline access and check the Wallet Instance from its cached Status List.
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
  // Clean up stale Key Attestations
  yield* fork(handleKeyAttestationsCleanUp);
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
