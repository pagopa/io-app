import { SagaIterator } from "redux-saga";
import { call, put, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { uniqWith, isEqual } from "lodash";
import { savePendingAction } from "../actions";
import { Action } from "../../../store/actions/types";
import { applicationInitialized } from "../../../store/actions/application";

const retriableActions: Array<Action> = [];

export function* watchPendingActionsSaga(): SagaIterator {
  yield* takeEvery(savePendingAction, handleRetriableAction);
  yield* takeLatest(applicationInitialized, handleApplicationInitialized);
}

function* handleRetriableAction(action: ReturnType<typeof savePendingAction>) {
  const { pendingAction: actionToRetry } = action.payload;
  // eslint-disable-next-line functional/immutable-data
  yield* call(() => retriableActions.push(actionToRetry));
}

function* handleApplicationInitialized(
  _: ReturnType<typeof applicationInitialized>
) {
  for (const action of uniqWith(retriableActions, isEqual)) {
    yield* put(action);
  }

  // eslint-disable-next-line functional/immutable-data
  retriableActions.length = 0;
}
