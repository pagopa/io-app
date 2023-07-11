import { SagaIterator } from "redux-saga";
import { put, select, take, takeLatest } from "typed-redux-saga/macro";
import { applicationInitialized } from "../../../store/actions/application";
import { clearPendingAction } from "../store/actions";
import { fastLoginPendingActionsSelector } from "../store/selectors";

export function* watchPendingActionsSaga(): SagaIterator {
  yield* takeLatest(applicationInitialized, handleApplicationInitialized);
}

function* handleApplicationInitialized(
  _: ReturnType<typeof applicationInitialized>
) {
  const { actionsToWaitFor } = _.payload;
  const pendingActions = yield* select(fastLoginPendingActionsSelector);
  if (pendingActions.length === 0) {
    return;
  }
  for (const action of actionsToWaitFor) {
    yield* take(action);
  }
  for (const action of pendingActions) {
    yield* put(action);
  }
  yield* put(clearPendingAction());
}
