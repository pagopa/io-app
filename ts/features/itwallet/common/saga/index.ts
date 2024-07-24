import { SagaIterator } from "redux-saga";
import { fork, select, put } from "typed-redux-saga/macro";
import { isItWalletTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { trialSystemActivationStatus } from "../../../trialSystem/store/actions";
import { watchItwIdentificationSaga } from "../../identification/saga";
import { checkWalletInstanceStateSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import { handleWalletCredentialsRehydration } from "../../credentials/saga/handleWalletCredentialsRehydration";
import { ITW_TRIAL_ID } from "../utils/itwTrialUtils";

export function* watchItwSaga(): SagaIterator {
  const isItWalletTestEnabled: ReturnType<
    typeof isItWalletTestEnabledSelector
  > = yield* select(isItWalletTestEnabledSelector);

  if (!isItWalletTestEnabled) {
    // If itw test is not enabled do not initialize itw sagas
    return;
  }

  yield* fork(checkWalletInstanceStateSaga);
  yield* fork(handleWalletCredentialsRehydration);
  yield* fork(watchItwIdentificationSaga);

  // IT Wallet trial status refresh
  yield* put(trialSystemActivationStatus.request(ITW_TRIAL_ID));
}
