import * as BackgroundTask from "expo-background-task";
import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import {
  trackItwStatusListFetchRegisterFailure,
  trackItwStatusListFetchRegistered,
  trackItwStatusListLastChecktime
} from "../analytics";
import { registerItwStatusListFetchTask } from "../tasks";
import { getLastCheckTimestamp } from "../utils/storage";

/**
 * Registers the ITW Status List fetch task with expo-background-task.
 *
 * This is a fire-and-forget operation: if the background task API is not
 * available (e.g. restricted by the OS), the registration is silently skipped.
 * The task must be defined in global scope via TaskManager.defineTask before
 * this saga is called (see ts/features/itwallet/background/tasks.ts).
 */
export function* registerStatusListFetchTaskSaga(): SagaIterator {
  try {
    const status: BackgroundTask.BackgroundTaskStatus = yield* call(
      BackgroundTask.getStatusAsync
    );
    if (status === BackgroundTask.BackgroundTaskStatus.Available) {
      yield* call(registerItwStatusListFetchTask);
      yield* call(trackItwStatusListFetchRegistered);
    }
  } catch (e) {
    yield* call(trackItwStatusListFetchRegisterFailure, e);
  }
}

/**
 * Tracks the last execution of the ITW Status List fetch task on app open,
 * to have a baseline for the background fetch frequency.
 *
 * TODO: remove once the status list is implemented
 */
export function* trackLastStatusListFetchTaskSaga(): SagaIterator {
  try {
    const timestamp = yield* call(getLastCheckTimestamp);
    const date = timestamp ? new Date(timestamp).toISOString() : "never";
    yield* call(trackItwStatusListLastChecktime, date);
  } catch {
    // Errors are ignored
  }
}
