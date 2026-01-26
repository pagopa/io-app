import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { SagaIterator } from "redux-saga";
import { call, fork, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { watchItwCredentialsSaga } from "../../credentials/saga";
import { checkCredentialsStatusAssertion } from "../../credentials/saga/checkCredentialsStatusAssertion";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors/index.ts";
import { watchItwCredentialsCatalogueSaga } from "../../credentialsCatalogue/saga/index.ts";
import { checkHasNfcFeatureSaga } from "../../identification/common/saga/index.ts";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { checkCurrentWalletInstanceStateSaga } from "../../lifecycle/saga/checkCurrentWalletInstanceStateSaga.ts";
import { warmUpIntegrityServiceSaga } from "../../lifecycle/saga/checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceInconsistencySaga,
  checkWalletInstanceStateSaga
} from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import { checkFiscalCodeEnabledSaga } from "../../trialSystem/saga/checkFiscalCodeIsEnabledSaga.ts";
import {
  watchItwAnalyticsSaga,
  syncItwAnalyticsProperties
} from "../../analytics/saga";
import {
  itwFreezeSimplifiedActivationRequirements,
  itwSetAuthLevel,
  itwSetFiscalCodeWhitelisted
} from "../store/actions/preferences.ts";
import { isItwCredential } from "../utils/itwCredentialUtils.ts";
import { watchItwEnvironment } from "./environment";
import { watchItwOfflineAccess } from "./offlineAccess.ts";

export function* watchItwSaga(): SagaIterator {
  yield* takeLatest(
    itwSetFiscalCodeWhitelisted,
    handleAuthLevelSanitizationSaga
  );

  yield* fork(warmUpIntegrityServiceSaga);
  yield* fork(watchItwLifecycleSaga);
  // Check if the fiscal code is enabled, to enable the L3
  yield* fork(checkFiscalCodeEnabledSaga);
  // Fetch and process the Digital Credentials Catalogue
  yield* fork(watchItwCredentialsCatalogueSaga);

  // Watch ITW analytics lifecycle (initial sync and reactive updates)
  yield* fork(watchItwAnalyticsSaga);

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
}

/**
 * Watcher for ITW sagas that do not require internet connection or a valid session
 */
export function* watchItwOfflineSaga(): SagaIterator {
  yield* fork(watchItwCredentialsSaga);
  yield* fork(handleWalletCredentialsRehydration);
  // Check if the device has the NFC Feature
  yield* fork(checkHasNfcFeatureSaga);
  // Handle environment changes
  yield* fork(watchItwEnvironment);
  // Handle offline access counter increment and reset
  yield* fork(watchItwOfflineAccess);
  // Sync ITW analytics properties
  yield* fork(syncItwAnalyticsProperties);
}

/**
 * Sanitizes the authentication level to fix an inconsistency introduced by a regression in app version 3.21.
 *
 * This saga ensures that users with an L3 PID credential (assurance_level = high) have their
 * `auth_level` correctly set to 'L3'. It also freezes the simplified activation requirements
 * to maintain consistency.
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
  yield* put(itwFreezeSimplifiedActivationRequirements());
};
