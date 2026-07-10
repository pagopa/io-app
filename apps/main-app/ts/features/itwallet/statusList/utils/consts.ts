export const STORAGE_PREFIX = "@io.itwallet.statusList";

export const STORAGE_KEY_LAST_CHECK_TIME = `${STORAGE_PREFIX}:lastCheckTime`;

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
export const ITW_STATUS_LIST_FETCH_TASK_INTERVAL_MINUTES = 60 * 12;
