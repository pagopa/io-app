import { BackgroundFetchStatus } from "react-native-background-fetch";
import { ActionType, createStandardAction } from "typesafe-actions";
import {
  BackgroundFetchTaskConfig,
  BackgroundFetchTaskId
} from "../../utils/tasks";

/**
 * Stores the current background fetch initialization status
 * (available, denied, restricted).
 */
export const backgroundFetchUpdateStatus = createStandardAction(
  "BACKGROUND_FETCH_UPDATE_STATUS"
)<BackgroundFetchStatus>();

/**
 * Dispatched when a background fetch event occurs.
 * The payload is the taskId provided by the OS/library.
 */
export const backgroundFetchEvent = createStandardAction(
  "BACKGROUND_FETCH_EVENT"
)<string>();

/**
 * Schedules a custom background task.
 */
export const backgroundFetchScheduleTask = createStandardAction(
  "BACKGROUND_FETCH_SCHEDULE_TASK"
)<BackgroundFetchTaskConfig>();

/**
 * Cancels a previously scheduled background task.
 */
export const backgroundFetchCancelTask = createStandardAction(
  "BACKGROUND_FETCH_CANCEL_TASK"
)<BackgroundFetchTaskId>();

export type BackgroundFetchActions =
  | ActionType<typeof backgroundFetchUpdateStatus>
  | ActionType<typeof backgroundFetchEvent>
  | ActionType<typeof backgroundFetchScheduleTask>
  | ActionType<typeof backgroundFetchCancelTask>;
