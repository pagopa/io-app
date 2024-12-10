import { SagaIterator } from "redux-saga";
import { call, fork } from "typed-redux-saga/macro";
import { watchItwCredentialsSaga } from "../../credentials/saga";
import { checkCredentialsStatusAttestation } from "../../credentials/saga/checkCredentialsStatusAttestation";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { checkWalletInstanceStateSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";

function* checkWalletInstanceAndCredentialsValiditySaga() {
  // Status attestations of credentials are checked only in case of a valid wallet instance.
  // For this reason, these sagas must be called sequentially.
  yield* call(checkWalletInstanceStateSaga);
  yield* call(checkCredentialsStatusAttestation);
}

export function* watchItwSaga(): SagaIterator {
  yield* fork(checkWalletInstanceAndCredentialsValiditySaga);
  yield* fork(handleWalletCredentialsRehydration);
  yield* fork(watchItwCredentialsSaga);
  yield* fork(watchItwLifecycleSaga);
}
