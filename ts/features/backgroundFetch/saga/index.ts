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

function* isBackgroundFetchStatusAvailable(): SagaIterator {
  const status: ReturnType<typeof backgroundFetchStatusSelector> | undefined =
    yield* select(backgroundFetchStatusSelector);
  if (status === undefined) {
    const statusUpdateAction = yield* take(backgroundFetchUpdateStatus);
    return statusUpdateAction.payload === BackgroundFetch.STATUS_AVAILABLE;
  }
  return status === BackgroundFetch.STATUS_AVAILABLE;
}

/**
 * Root saga for the backgroundFetch feature.
 *
 * - Listens for background fetch events and routes them to the appropriate handler.
 * - Handles scheduling and cancellation of custom background tasks.
 */
export function* watchBackgroundFetchSaga(): SagaIterator {
  yield* takeEvery(backgroundFetchEvent, handleBackgroundFetchEventSaga);

  yield* takeEvery(backgroundFetchScheduleTask, function* (action) {
    const isAvailable: boolean = yield* call(isBackgroundFetchStatusAvailable);
    if (isAvailable) {
      yield* call(BackgroundFetch.scheduleTask, action.payload);
    }
  });

  yield* takeEvery(backgroundFetchCancelTask, function* (action) {
    const isAvailable: boolean = yield* call(isBackgroundFetchStatusAvailable);
    if (isAvailable) {
      yield* call(BackgroundFetch.stop, action.payload);
    }
  });
}
