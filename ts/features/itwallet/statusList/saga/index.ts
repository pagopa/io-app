import * as BackgroundTask from "expo-background-task";
import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import {
  trackItwStatusListFetchRegisterFailure,
  trackItwStatusListFetchRegistered
} from "../analytics";
import { registerItwStatusListFetchTask } from "../tasks";

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
