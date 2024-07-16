import { SagaIterator } from "redux-saga";
import { fork, put, select } from "typed-redux-saga/macro";
import { isItWalletTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { trialSystemActivationStatus } from "../../../trialSystem/store/actions";
import { watchItwIdentificationSaga } from "../../identification/saga";
import { ITW_TRIAL_ID } from "../utils/itwTrialUtils";

export function* watchItwSaga(): SagaIterator {
  const isItWalletTestEnabled: ReturnType<
    typeof isItWalletTestEnabledSelector
  > = yield* select(isItWalletTestEnabledSelector);

  if (!isItWalletTestEnabled) {
    // If itw test is not enabled do not initialize itw sagas
    return;
  }

  yield* fork(watchItwIdentificationSaga);

  // IT Wallet trial status refresh
  yield* put(trialSystemActivationStatus.request(ITW_TRIAL_ID));
}
