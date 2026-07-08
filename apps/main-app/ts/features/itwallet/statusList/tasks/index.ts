import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { refreshStaleEntries } from "../utils/refresh";
import { ITW_STATUS_LIST_FETCH_TASK } from "../utils/consts";

/**
 * Register the ITW Status List fetch task handler with expo-task-manager.
 * Important: must be defined at module level.
 *
 * Current behavior: stores the background wake-up timestamp (used later for analytics).
 * Status List refresh/fetch logic will be added separately.
 */
TaskManager.defineTask(ITW_STATUS_LIST_FETCH_TASK, async () => {
  try {
    // TODO [SIW-4623] get itw spec version from background context
    const itwVersion = "1.3.3";

    await refreshStaleEntries({ itwVersion });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
