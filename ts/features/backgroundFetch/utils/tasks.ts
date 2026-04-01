import { TaskConfig } from "react-native-background-fetch";
import { Prettify } from "../../../types/helpers";

/**
 * List of background fetch tasks.
 *
 * **On iOS**, each custom task ID must also be declared in Info.plist
 * under `BGTaskSchedulerPermittedIdentifiers`.
 */
export enum BackgroundFetchTaskId {
  // Automatic event dispatched by react-native-background-fetch.
  // Does not need to be manually scheduled or registered.
  REACT_NATIVE_BACKGROUND_FETCH = "react-native-background-fetch"
}

export type BackgroundFetchTaskConfig = Prettify<
  TaskConfig & {
    taskId: BackgroundFetchTaskId;
  }
>;
