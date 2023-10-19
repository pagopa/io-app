import { SagaIterator } from "redux-saga";
import { put, delay, takeLatest } from "typed-redux-saga/macro";
import { itwPresentationChecks } from "../../store/actions/new/itwPresentationActions";

export function* watchItwPresentationSaga(): SagaIterator {
  yield* takeLatest(itwPresentationChecks.request, itwPresentationChecksSaga);
}

/*
 * This saga handles the RP presentation checks.
 * TODO: add the actual implementation as it currently only delays and returns success.
 * action: ActionType<typeof itwPresentationChecks.request>
 */
export function* itwPresentationChecksSaga(): SagaIterator {
  yield* delay(1500);
  yield* put(itwPresentationChecks.success());
}
