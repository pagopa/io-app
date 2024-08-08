import { SagaIterator } from "redux-saga";
import { fork, put } from "typed-redux-saga/macro";
import { trialSystemActivationStatus } from "../../../trialSystem/store/actions";
import { watchItwIdentificationSaga } from "../../identification/saga";
import { checkWalletInstanceStateSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { itwTrialId } from "../../../../config";
import { itwCieIsSupported } from "../../identification/store/actions";

export function* watchItwSaga(): SagaIterator {
  yield* fork(checkWalletInstanceStateSaga);
  yield* fork(handleWalletCredentialsRehydration);
  yield* fork(watchItwIdentificationSaga);

  // TODO: [SIW-1404] remove this CIE check and move the logic to xstate
  yield* put(itwCieIsSupported.request());
  // IT Wallet trial status refresh
  yield* put(trialSystemActivationStatus.request(itwTrialId));
}
