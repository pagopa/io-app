import { SagaIterator } from "redux-saga";
import { fork, put, call, take, select } from "typed-redux-saga/macro";
import * as pot from "@pagopa/ts-commons/lib/pot";
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
import { trialStatusPotSelector } from "../../../trialSystem/store/reducers";

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
  if (isActionOf(trialSystemActivationStatus.failure, outputAction)) {
    /* We check if the error is due to the user not being found in the trial system and we try to subscribe the user
    the trial system returns 404 if the usuer is not found or if the trial id is not found. However, the trial id is
    hardcoded in the config file and we assume it is correct so the only reason for the 404 is the user not being found. */
    const potStatus = yield* select(trialStatusPotSelector(itwTrialId));
    if (
      pot.isError(potStatus) &&
      potStatus.error.type === "TRIAL_SYSTEM_USER_NOT_FOUND"
    ) {
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
