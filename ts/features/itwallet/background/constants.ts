/**
 * Identifier for the ITW Wallet Instance background check task.
 * Must match the task name used in TaskManager.defineTask.
 */
export const ITW_WALLET_CHECK_TASK = "io-itw-wallet-check";

/**
 * Interval in minutes for the ITW background check task.
 * The task will be scheduled to run approximately every this amount of minutes.
 * Note that the actual execution timing is determined by the OS and may vary.
 */
export const ITW_BACKGROUND_TASK_INTERVAL_MINUTES = 60 * 4;
