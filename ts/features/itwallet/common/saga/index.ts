import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { isItWalletTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { watchItwIdentificationSaga } from "../../identification/saga";
import { watchItwIssuanceSaga } from "../../issuance/saga";

export function* watchItwSaga(): SagaIterator {
  const isItWalletTestEnabled: ReturnType<
    typeof isItWalletTestEnabledSelector
  > = yield* select(isItWalletTestEnabledSelector);

  if (!isItWalletTestEnabled) {
    // If itw test is not enabled do not initialize itw sagas
    return;
  }

  yield* fork(watchItwIdentificationSaga);
  yield* fork(watchItwIssuanceSaga);
}
