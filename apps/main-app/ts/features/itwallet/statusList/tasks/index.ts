import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { ITW_STATUS_LIST_FETCH_TASK } from "../utils/consts";
import { storeLastStatusListCheckTimestamp } from "../utils/storage";

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
