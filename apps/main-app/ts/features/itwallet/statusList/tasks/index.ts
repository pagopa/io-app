import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import {
  trackItwStatusListFetchRegistered,
  trackItwStatusListFetchRegisterFailure
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
const ITW_STATUS_LIST_FETCH_TASK_INTERVAL_MINUTES = 60 * 12;

/**
 * Register the ITW Status List fetch task handler with expo-task-manager.
 * Important: must be defined at module level.
 *
 * Current behavior: stores the background wake-up timestamp (used later for analytics).
 * Status List refresh/fetch logic will be added separately.
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

/**
 * Registers the ITW Status List background fetch task with expo-background-task
 * if the background task API is available and the task is not already registered.
 */
export const registerItwStatusListFetchTask = async (): Promise<void> => {
  try {
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
  } catch (error) {
    trackItwStatusListFetchRegisterFailure(
      error instanceof Error ? error.message : "unknown"
    );
  }
};

/**
 * Unregister the ITW Status List background fetch task with expo-background-task.
 *
 * No-op if the task is not registered; errors during unregistration are ignored.
 */
export const unregisterItwStatusListFetchTask = async (): Promise<void> => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      ITW_STATUS_LIST_FETCH_TASK
    );
    if (!isRegistered) {
      return;
    }

    await BackgroundTask.unregisterTaskAsync(ITW_STATUS_LIST_FETCH_TASK);
  } catch {
    // Ignore errors during unregistration
  }
};
