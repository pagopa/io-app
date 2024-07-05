import { SagaIterator } from "redux-saga";
import { fork, select, call } from "typed-redux-saga/macro";
import { isItWalletTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { watchItwIdentificationSaga } from "../../identification/saga";
import { checkWalletInstanceStateSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";

export function* watchItwSaga(): SagaIterator {
  const isItWalletTestEnabled: ReturnType<
    typeof isItWalletTestEnabledSelector
  > = yield* select(isItWalletTestEnabledSelector);

  if (!isItWalletTestEnabled) {
    // If itw test is not enabled do not initialize itw sagas
    return;
  }

  yield* call(checkWalletInstanceStateSaga);
  yield* fork(watchItwIdentificationSaga);
}
