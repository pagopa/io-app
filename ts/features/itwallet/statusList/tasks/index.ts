import * as BackgroundTask from "expo-background-task";
import { storeLastCheckTimestamp } from "../utils/storage";

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
 * Registers the ITW Status List background fetch task with expo-background-task.
 *
 * @throws Will throw an error if the registration fails
 */
export const registerItwStatusListFetchTask = async (): Promise<void> => {
  await BackgroundTask.registerTaskAsync(ITW_STATUS_LIST_FETCH_TASK, {
    minimumInterval: ITW_STATUS_LIST_FETCH_TASK_INTERVAL_MINUTES
  });
};

/**
 * Handler for the ITW Status List fetch task.
 *
 * IMPORTANT: This functions is headless and cannot access to the redux store
 * or any other app context.
 *
 * Checks whether the Status List needs to be refreshed (i.e. last
 * check was more than 24 hours ago) and, if so, fetches it and updates the
 * last check timestamp.
 */
export const itwStatusListFetchTaskHandler =
  async (): Promise<BackgroundTask.BackgroundTaskResult> => {
    try {
      // TODO add WI and credentials check once Status List is implemented
      await storeLastCheckTimestamp(Date.now());

      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  };
