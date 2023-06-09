import { SagaIterator } from "redux-saga";
import { call, put, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { uniqWith, isEqual } from "lodash";
import { retriableAction } from "../actions";
import { Action } from "../../../store/actions/types";
import { applicationInitialized } from "../../../store/actions/application";

const retriableActions: Array<Action> = [];

export function* watchRetriableActionsSaga(): SagaIterator {
  yield* takeEvery(retriableAction, handleRetriableAction);
  yield* takeLatest(applicationInitialized, handleApplicationInitialized);
}

function* handleRetriableAction(action: ReturnType<typeof retriableAction>) {
  const { actionToRetry } = action.payload;
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
