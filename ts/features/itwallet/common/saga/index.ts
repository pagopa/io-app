import { SagaIterator } from "redux-saga";
import { call, fork } from "typed-redux-saga/macro";
import { watchItwCredentialsSaga } from "../../credentials/saga";
import { checkCredentialsStatusAttestation } from "../../credentials/saga/checkCredentialsStatusAttestation";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { warmUpIntegrityServiceSaga } from "../../lifecycle/saga/checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceInconsistencySaga,
  checkWalletInstanceStateSaga
} from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import { checkHasNfcFeatureSaga } from "../../identification/saga";
import { checkCurrentWalletInstanceStateSaga } from "../../lifecycle/saga/checkCurrentWalletInstanceStateSaga.ts";
import { checkFiscalCodeEnabledSaga } from "../../trialSystem/saga/checkFiscalCodeIsEnabledSaga.ts";
import { watchItwEnvironment } from "./environment";

export function* watchItwSaga(): SagaIterator {
  yield* fork(warmUpIntegrityServiceSaga);
  yield* fork(watchItwLifecycleSaga);
  // Check if the fiscal code is enabled, to enable the L3
  yield* fork(checkFiscalCodeEnabledSaga);

  const isWalletInstanceConsistent = yield* call(
    checkWalletInstanceInconsistencySaga
  );

  // If the wallet instance is inconsistent, we cannot proceed further.
  if (!isWalletInstanceConsistent) {
    return;
  }

  // Status attestations of credentials are checked only in case of a valid wallet instance.
  // For this reason, these sagas must be called sequentially.
  yield* call(checkWalletInstanceStateSaga);
  yield* call(checkCurrentWalletInstanceStateSaga);
  yield* call(checkCredentialsStatusAttestation);
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
}
