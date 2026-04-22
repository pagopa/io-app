import * as BackgroundTask from "expo-background-task";
import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import {
  ITW_BACKGROUND_TASK_INTERVAL_MINUTES,
  ITW_WALLET_CHECK_TASK
} from "./constants";
import {
  trackItwBackgroundTaskRegistered,
  trackItwBackgroundTaskRegisterFailure
} from "./analytics";

/**
 * Registers the ITW background task with expo-background-task.
 *
 * This is a fire-and-forget operation: if the background task API is not
 * available (e.g. restricted by the OS), the registration is silently skipped.
 * The task must be defined in global scope via TaskManager.defineTask before
 * this saga is called (see ts/features/itwallet/background/tasks.ts).
 */
export function* registerItwBackgroundTaskSaga(): SagaIterator {
  try {
    const status: BackgroundTask.BackgroundTaskStatus = yield* call(
      BackgroundTask.getStatusAsync
    );
    if (status === BackgroundTask.BackgroundTaskStatus.Available) {
      yield* call(BackgroundTask.registerTaskAsync, ITW_WALLET_CHECK_TASK, {
        minimumInterval: ITW_BACKGROUND_TASK_INTERVAL_MINUTES
      });
      yield* call(trackItwBackgroundTaskRegistered);
    }
  } catch (e) {
    yield* call(trackItwBackgroundTaskRegisterFailure, e);
  }
}
