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
import { checkCurrentWalletInstanceStateSaga } from "../../lifecycle/saga/checkCurrentWalletInstanceStateSaga.ts";

export function* watchItwSaga(): SagaIterator {
  const isWalletInstanceConsistent = yield* call(
    checkWalletInstanceInconsistencySaga
  );

  // If the wallet instance is inconsistent, we cannot proceed further.
  if (!isWalletInstanceConsistent) {
    return;
  }
  yield* fork(warmUpIntegrityServiceSaga);
  yield* fork(watchItwLifecycleSaga);

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
}
