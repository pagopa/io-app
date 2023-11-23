import { SagaIterator } from "redux-saga";
import { put, delay, takeLatest, call } from "typed-redux-saga/macro";
import {
  itwPresentation,
  itwPresentationChecks
} from "../../store/actions/new/itwPresentationActions";
import { verifyPin } from "../ItwSagaUtils";

export function* watchItwPresentationSaga(): SagaIterator {
  yield* takeLatest(itwPresentationChecks.request, itwPresentationChecksSaga);
  yield* takeLatest(itwPresentation.request, itwPresentationSaga);
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

/**
 * This saga handles the RP presentation.
 * TODO: add the actual implementation as it currently only delays and returns success.
 * action: ActionType<typeof itwPresentation.request>
 */
export function* itwPresentationSaga(): SagaIterator {
  yield* call(verifyPin);
  yield* delay(1500);
  yield* put(itwPresentation.success());
}
