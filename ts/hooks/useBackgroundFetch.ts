/* eslint-disable no-console */
import { useCallback, useEffect, useState } from "react";
import BackgroundFetch from "react-native-background-fetch";

export const useBackgroundFetch = () => {
  const [events, setEvents] = useState<
    ReadonlyArray<{ taskId: string; timestamp: string }>
  >([]);

  const addEvent = async (taskId: string) => {
    setEvents(currentEvents => [
      ...currentEvents,
      {
        taskId,
        timestamp: new Date().toString()
      }
    ]);
  };

  const initBackgroundFetch = useCallback(async () => {
    // BackgroundFetch event handler.
    const onEvent = async (taskId: string) => {
      console.log("[BackgroundFetch] task: ", taskId);
      // Do your background work...
      await addEvent(taskId);
      // IMPORTANT:  You must signal to the OS that your task is complete.
      BackgroundFetch.finish(taskId);
    };

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    const onTimeout = async (taskId: string) => {
      console.warn("[BackgroundFetch] TIMEOUT task: ", taskId);
      BackgroundFetch.finish(taskId);
    };

    // Initialize BackgroundFetch only once when component mounts.
    const status = await BackgroundFetch.configure(
      { minimumFetchInterval: 15 },
      onEvent,
      onTimeout
    );

    console.log("[BackgroundFetch] configure status: ", status);
  }, []);

  useEffect(() => {
    console.log(events);
  }, [events]);

  useEffect(() => {
    void initBackgroundFetch();
  }, [initBackgroundFetch]);
};
