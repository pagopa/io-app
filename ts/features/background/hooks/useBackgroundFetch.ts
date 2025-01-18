/* eslint-disable no-console */
import { useCallback, useEffect } from "react";
import BackgroundFetch from "react-native-background-fetch";

/**
 * To add a new task, add the ID to the enum
 *
 * **On iOS**, you need to add it in the Info.plist file under BGTaskSchedulerPermittedIdentifiers
 */
enum BackgroundFetchTaskId {
  REACT_NATIVE_BACKGROUND_FETCH = "react-native-background-fetch",
  ITW_CHECK = "com.pagopa.io.itw_check"
}

export const useBackgroundFetch = () => {
  const initBackgroundFetch = useCallback(async () => {
    // BackgroundFetch event handler.
    const onEvent = async (taskId: string) => {
      console.log("[BackgroundFetch] task: ", taskId, new Date().toString());
      // Do your background work...

      switch (taskId) {
        case BackgroundFetchTaskId.REACT_NATIVE_BACKGROUND_FETCH:
          break;
        case BackgroundFetchTaskId.ITW_CHECK:
          console.log("itw check");
          break;
      }

      // IMPORTANT:  You must signal to the OS that your task is complete.
      BackgroundFetch.finish(taskId);
    };

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    const onTimeout = async (taskId: string) => {
      BackgroundFetch.finish(taskId);
    };

    // Initialize BackgroundFetch only once when component mounts.
    await BackgroundFetch.configure(
      { minimumFetchInterval: 30 },
      onEvent,
      onTimeout
    );

    await BackgroundFetch.scheduleTask({
      taskId: BackgroundFetchTaskId.ITW_CHECK,
      forceAlarmManager: true,
      delay: 5000,
      periodic: true,
      requiresNetworkConnectivity: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      stopOnTerminate: false,
      startOnBoot: true
    });
  }, []);

  useEffect(() => {
    void initBackgroundFetch();
  }, [initBackgroundFetch]);
};
