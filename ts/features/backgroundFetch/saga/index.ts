import { SagaIterator } from "redux-saga";
import { select, take, takeEvery } from "typed-redux-saga/macro";
import {
  backgroundFetchEvent,
  backgroundFetchUpdateStatus
} from "../store/actions";
import { backgroundFetchStatusSelector } from "../store/selectors";
import { handleBackgroundFetchEventSaga } from "./handleBackgroundFetchEventSaga";

export function* getBackgroundFetchStatus() {
  const status = yield* select(backgroundFetchStatusSelector);
  if (status === undefined) {
    const statusUpdateAction = yield* take(backgroundFetchUpdateStatus);
    return statusUpdateAction.payload;
  }
  return status;
}

export function* watchBackgroundFetchSaga(): SagaIterator {
  yield* takeEvery(backgroundFetchEvent, handleBackgroundFetchEventSaga);
}
