import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import {
  ITW_STATUS_LIST_FETCH_TASK,
  ITW_STATUS_LIST_FETCH_TASK_INTERVAL_MINUTES
} from ".";
import {
  trackItwStatusListFetchRegistered,
  trackItwStatusListFetchRegisterFailure
} from "../analytics";

export {
  ITW_STATUS_LIST_FETCH_TASK,
  ITW_STATUS_LIST_FETCH_TASK_INTERVAL_MINUTES
};

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
