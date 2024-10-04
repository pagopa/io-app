import { SagaIterator } from "redux-saga";
import { fork, put, call, take, select } from "typed-redux-saga/macro";
import { isActionOf } from "typesafe-actions";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusUpsert
} from "../../../trialSystem/store/actions";
import { watchItwIdentificationSaga } from "../../identification/saga";
import { checkWalletInstanceStateSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { itwTrialId } from "../../../../config";
import { itwCieIsSupported } from "../../identification/store/actions";
import { watchItwCredentialsSaga } from "../../credentials/saga";
import { watchItwLifecycleSaga } from "../../lifecycle/saga";
import { checkCredentialsStatusAttestation } from "../../credentials/saga/checkCredentialsStatusAttestation";
import { trialStatusSelector } from "../../../trialSystem/store/reducers";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";

function* checkWalletInstanceAndCredentialsValiditySaga() {
  // Status attestations of credentials are checked only in case of a valid wallet instance.
  // For this reason, these sagas must be called sequentially.
  yield* call(checkWalletInstanceStateSaga);
  yield* call(checkCredentialsStatusAttestation);
}

/**
 * Handle the trial system subscription which currently fetches the trial status
 * and if the user is unsubscribed it automatically subscribes the user to the trial.
 */
export function* handleTrialSystemSubscription() {
  // IT Wallet trial status refresh
  yield* put(trialSystemActivationStatus.request(itwTrialId));
  const outputAction = yield* take([
    trialSystemActivationStatus.success,
    trialSystemActivationStatus.failure
  ]);
  if (isActionOf(trialSystemActivationStatus.success, outputAction)) {
    const status = yield* select(trialStatusSelector(itwTrialId));
    if (status && status === SubscriptionStateEnum.UNSUBSCRIBED) {
      yield* put(trialSystemActivationStatusUpsert.request(itwTrialId));
    }
  }
}

export function* watchItwSaga(): SagaIterator {
  yield* fork(checkWalletInstanceAndCredentialsValiditySaga);
  yield* fork(handleWalletCredentialsRehydration);
  yield* fork(watchItwIdentificationSaga);
  yield* fork(watchItwCredentialsSaga);
  yield* fork(watchItwLifecycleSaga);
  yield* fork(handleTrialSystemSubscription);

  // TODO: [SIW-1404] remove this CIE check and move the logic to xstate
  yield* put(itwCieIsSupported.request());
}
