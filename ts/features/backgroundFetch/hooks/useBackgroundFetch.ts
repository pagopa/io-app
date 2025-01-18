import { useCallback, useEffect } from "react";
import BackgroundFetch from "react-native-background-fetch";
import { backgroundFetchIntervalMinutes } from "../../../config";
import { useIODispatch } from "../../../store/hooks";
import {
  backgroundFetchEvent,
  backgroundFetchUpdateStatus
} from "../store/actions";

/**
 * Hook to configure and initialize background fetch functionality.
 *
 * This hook sets up background tasks that can run periodically even when the app
 * is not in the foreground. The interval between fetches is configured via
 * the `backgroundFetchIntervalMinutes` environment variable.
 *
 * When a background fetch event occurs, it dispatches a `backgroundFetchEvent` action
 * which is handled by the `handleBackgroundFetchEventSaga`. The saga can then
 * execute the appropriate background task based on the taskId.
 *
 * **Note**: this hook should be called only once by the root component.
 */
export const useBackgroundFetch = () => {
  const dispatch = useIODispatch();

  const initBackgroundFetch = useCallback(async () => {
    // Configure and initialize the background fetch service
    const status = await BackgroundFetch.configure(
      {
        // Set minimum interval between background fetches
        minimumFetchInterval: backgroundFetchIntervalMinutes
      },
      // Event handler callback - dispatches event to saga for processing
      (taskId: string) => dispatch(backgroundFetchEvent(taskId)),
      // Timeout handler - called if task exceeds allowed runtime
      (taskId: string) => BackgroundFetch.finish(taskId)
    );

    // Update global state with background fetch status
    dispatch(backgroundFetchUpdateStatus(status));
  }, [dispatch]);

  // Initialize background fetch when component is mounted
  useEffect(() => {
    void initBackgroundFetch();
  }, [initBackgroundFetch]);
};
