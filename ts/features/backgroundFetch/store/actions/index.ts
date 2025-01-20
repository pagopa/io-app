import { BackgroundFetchStatus } from "react-native-background-fetch";
import { ActionType, createStandardAction } from "typesafe-actions";
import {
  BackgroundFetchTaskConfig,
  BackgroundFetchTaskId
} from "../../utils/tasks";

export const backgroundFetchUpdateStatus = createStandardAction(
  "BACKGROUND_FETCH_UPDATE_STATUS"
)<BackgroundFetchStatus>();

export const backgroundFetchEvent = createStandardAction(
  "BACKGROUND_FETCH_EVENT"
)<string>();

export const backgroundFetchScheduleTask = createStandardAction(
  "BACKGROUND_FETCH_SCHEDULE_TASK"
)<BackgroundFetchTaskConfig>();

export const backgroundFetchCancelTask = createStandardAction(
  "BACKGROUND_FETCH_CANCEL_TASK"
)<BackgroundFetchTaskId>();

export type BackgroundFetchActions =
  | ActionType<typeof backgroundFetchUpdateStatus>
  | ActionType<typeof backgroundFetchEvent>
  | ActionType<typeof backgroundFetchScheduleTask>
  | ActionType<typeof backgroundFetchCancelTask>;
