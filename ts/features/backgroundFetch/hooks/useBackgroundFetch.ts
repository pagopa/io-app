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
 * When a background fetch event occurs, it dispatches a `backgroundFetchEvent`
 * action which is handled by the `handleBackgroundFetchEventSaga`. The saga can
 * then execute the appropriate background task based on the taskId.
 *
 * **Note**: this hook should be called only once by the root component.
 */
export const useBackgroundFetch = () => {
  const dispatch = useIODispatch();

  const initBackgroundFetch = useCallback(async () => {
    const status = await BackgroundFetch.configure(
      { minimumFetchInterval: backgroundFetchIntervalMinutes },
      // Event handler: forward the taskId to the redux-saga handler
      (taskId: string) => dispatch(backgroundFetchEvent(taskId)),
      // Timeout handler: signal finish immediately if the task times out
      (taskId: string) => BackgroundFetch.finish(taskId)
    );
    dispatch(backgroundFetchUpdateStatus(status));
  }, [dispatch]);

  useEffect(() => {
    void initBackgroundFetch();
  }, [initBackgroundFetch]);
};
