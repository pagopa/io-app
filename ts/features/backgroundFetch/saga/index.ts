import BackgroundFetch from "react-native-background-fetch";
import { SagaIterator } from "redux-saga";
import { call, select, take, takeEvery } from "typed-redux-saga/macro";
import {
  backgroundFetchCancelTask,
  backgroundFetchEvent,
  backgroundFetchScheduleTask,
  backgroundFetchUpdateStatus
} from "../store/actions";
import { backgroundFetchStatusSelector } from "../store/selectors";
import { handleBackgroundFetchEventSaga } from "./handleBackgroundFetchEventSaga";

export function* isBackgroundFetchStatusAvailable() {
  const status = yield* select(backgroundFetchStatusSelector);
  if (status === undefined) {
    const statusUpdateAction = yield* take(backgroundFetchUpdateStatus);
    return statusUpdateAction.payload === BackgroundFetch.STATUS_AVAILABLE;
  }
  return status === BackgroundFetch.STATUS_AVAILABLE;
}

export function* watchBackgroundFetchSaga(): SagaIterator {
  // Background fetch event handler
  yield* takeEvery(backgroundFetchEvent, handleBackgroundFetchEventSaga);

  // Scheduled tasks registration handlers
  yield* takeEvery(backgroundFetchScheduleTask, function* (action) {
    if (yield* isBackgroundFetchStatusAvailable()) {
      yield* call(BackgroundFetch.scheduleTask, action.payload);
    }
  });
  yield* takeEvery(backgroundFetchCancelTask, function* (action) {
    if (yield* isBackgroundFetchStatusAvailable()) {
      yield* call(BackgroundFetch.stop, action.payload);
    }
  });
}
