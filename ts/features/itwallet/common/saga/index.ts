import { SagaIterator } from "redux-saga";
import { fork, put, call } from "typed-redux-saga/macro";
import { trialSystemActivationStatus } from "../../../trialSystem/store/actions";
import { watchItwIdentificationSaga } from "../../identification/saga";
import { checkWalletInstanceStateSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { itwTrialId } from "../../../../config";
import { itwCieIsSupported } from "../../identification/store/actions";
import { watchItwCredentialsSaga } from "../../credentials/saga";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { checkCredentialsStatusAttestation } from "../../credentials/saga/checkCredentialsStatusAttestation";

function* checkWalletInstanceAndCredentialsValiditySaga() {
  // Status attestations of credentials are checked only in case of a valid wallet instance.
  // For this reason, these sagas must be called sequentially.
  yield* call(checkWalletInstanceStateSaga);
  yield* call(checkCredentialsStatusAttestation);
}

export function* watchItwSaga(): SagaIterator {
  yield* fork(checkWalletInstanceAndCredentialsValiditySaga);
  yield* fork(handleWalletCredentialsRehydration);
  yield* fork(watchItwIdentificationSaga);
  yield* fork(watchItwCredentialsSaga);
  yield* fork(watchItwLifecycleSaga);

  // TODO: [SIW-1404] remove this CIE check and move the logic to xstate
  yield* put(itwCieIsSupported.request());
  // IT Wallet trial status refresh
  yield* put(trialSystemActivationStatus.request(itwTrialId));
}
