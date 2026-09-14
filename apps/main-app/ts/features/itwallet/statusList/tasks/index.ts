import { ItwVersion } from "@pagopa/io-react-native-wallet";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { EnvType, getEnv } from "../../common/utils/environment";
import {
  trackItwStatusListFetchRegistered,
  trackItwStatusListFetchRegisterFailure
} from "../analytics";
import { refreshStaleEntries } from "../utils/refresh";
import {
  getItwEnv,
  getItwSpecsVersion,
  storeItwEnv,
  storeItwSpecsVersion
} from "../utils/storage";

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
 * Reads the specs version persisted during foreground registration, then refreshes
 * stale Status List entries without depending on Redux.
 */
TaskManager.defineTask(ITW_STATUS_LIST_FETCH_TASK, async () => {
  try {
    const [itwVersion, env] = await Promise.all([
      getItwSpecsVersion(),
      getItwEnv()
    ]);
    await refreshStaleEntries({
      itwVersion,
      x509CertRoot: getEnv(env).X509_CERT_ROOT
    });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Persists current IT-Wallet specs version and environment, then
 * registers Status List background fetch task when needed.
 *
 * Persisting happens on every call so app updates can change background task
 * verification config without recreating OS task registration.
 */
export const registerItwStatusListFetchTask = async (
  itwVersion: ItwVersion,
  env: EnvType
): Promise<void> => {
  try {
    await Promise.all([storeItwSpecsVersion(itwVersion), storeItwEnv(env)]);
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
