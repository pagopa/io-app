import { SagaIterator } from "redux-saga";
import { put, select, takeLatest } from "typed-redux-saga/macro";
import { applicationInitialized } from "../../../store/actions/application";
import { fastLoginPendingActionsSelector } from "../store/reducers";
import { clearPendingAction } from "../actions";

export function* watchPendingActionsSaga(): SagaIterator {
  yield* takeLatest(applicationInitialized, handleApplicationInitialized);
}

function* handleApplicationInitialized(
  _: ReturnType<typeof applicationInitialized>
) {
  const pendingActions = yield* select(fastLoginPendingActionsSelector);
  for (const action of pendingActions) {
    yield* put(action);
  }
  yield* put(clearPendingAction());
}
