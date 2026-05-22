import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import {
  trackItwStatusListFetchRegistered,
  trackItwStatusListFetchRegisterFailure,
  trackItwStatusListFetchUnregistered
} from "../analytics";
import { storeLastStatusListCheckTimestamp } from "../utils/storage";

/**
 * Identifier for the ITW Status List background fetch task.
 * Must match the task name used in TaskManager.defineTask.
 */
export const ITW_STATUS_LIST_FETCH_TASK = "io-itw-status-list-fetch";

/**
 * Interval in minutes for the ITW Status List fetch task.
 * The task will be scheduled to run approximately every this amount of minutes.
 * Note that the actual execution timing is determined by the OS and may vary.
 */
export const ITW_STATUS_LIST_FETCH_TASK_INTERVAL_MINUTES = 60 * 4;

/**
 * Registers the ITW Status List background fetch task with expo-background-task
 * if the background task API is available and the task is not already registered.
 */
export const registerItwStatusListFetchTask = async (): Promise<void> => {
  const status: BackgroundTask.BackgroundTaskStatus =
    await BackgroundTask.getStatusAsync();

  if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
    trackItwStatusListFetchRegisterFailure("unavailable");
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    ITW_STATUS_LIST_FETCH_TASK
  );
  if (isRegistered) {
    return;
  }

  await BackgroundTask.registerTaskAsync(ITW_STATUS_LIST_FETCH_TASK, {
    minimumInterval: ITW_STATUS_LIST_FETCH_TASK_INTERVAL_MINUTES
  });
  trackItwStatusListFetchRegistered();
};

/**
 * Unregister the ITW Status List background fetch task with expo-background-task.
 *
 * @throws Will throw an error if the unregistration fails
 */
export const unregisterItwStatusListFetchTask = async (): Promise<void> => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    ITW_STATUS_LIST_FETCH_TASK
  );
  if (!isRegistered) {
    return;
  }

  await BackgroundTask.unregisterTaskAsync(ITW_STATUS_LIST_FETCH_TASK);
  trackItwStatusListFetchUnregistered();
};

/**
 * Register the ITW Status List fetch task handler with expo-task-manager.
 * Important: must be defined at module level.
 *
 * Checks whether the Status List needs to be refreshed (i.e. last
 * check was more than 24 hours ago) and, if so, fetches it and updates the
 * last check timestamp.
 */
TaskManager.defineTask(ITW_STATUS_LIST_FETCH_TASK, async () => {
  try {
    const now = Date.now();
    await storeLastStatusListCheckTimestamp(now);

    // TODO Add Status List fetch logic here

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
