import { SagaIterator } from "redux-saga";
import { call, fork } from "typed-redux-saga/macro";
import { watchItwCredentialsSaga } from "../../credentials/saga";
import { checkCredentialsStatusAttestation } from "../../credentials/saga/checkCredentialsStatusAttestation";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { warmUpIntegrityServiceSaga } from "../../lifecycle/saga/checkIntegrityServiceReadySaga";
import { checkWalletInstanceStateSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";

export function* watchItwSaga(): SagaIterator {
  yield* fork(warmUpIntegrityServiceSaga);
  yield* fork(watchItwCredentialsSaga);
  yield* fork(watchItwLifecycleSaga);

  // Status attestations of credentials are checked only in case of a valid wallet instance.
  // For this reason, these sagas must be called sequentially.
  yield* call(checkWalletInstanceStateSaga);
  yield* call(checkCredentialsStatusAttestation);
}
