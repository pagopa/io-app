import * as BackgroundTask from "expo-background-task";
import { store } from "../../../boot/configureStoreAndPersistor";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import { trackItwBackgroundTaskWakeUp } from "./analytics";

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
      const userOptedInForAnalytics = isMixpanelEnabled(store.getState());
      trackItwBackgroundTaskWakeUp(userOptedInForAnalytics);
      // TODO add WI and credentials check once Status List is implemented
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  };
