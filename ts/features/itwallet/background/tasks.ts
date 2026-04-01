import * as BackgroundTask from "expo-background-task";
import { trackItwBackgroundFetchWakeUp } from "../analytics";

/**
 * Handler for the ITW background task.
 *
 * Checks whether the Wallet Instance status needs to be refreshed (i.e. last
 * check was more than 24 hours ago) and, if so, runs the full validity check
 * saga against the redux store.
 */
export const itwWalletCheckTaskHandler =
  async (): Promise<BackgroundTask.BackgroundTaskResult> => {
    try {
      trackItwBackgroundFetchWakeUp();
      // TODO add WI and credentials check once Status List is implemented
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  };
