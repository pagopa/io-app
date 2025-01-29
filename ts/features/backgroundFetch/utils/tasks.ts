import { TaskConfig } from "react-native-background-fetch";
import { Prettify } from "../../../types/helpers";

/**
 * List of background fetch tasks scheduled
 *
 * **On iOS**, you need to add it in the Info.plist file under BGTaskSchedulerPermittedIdentifiers
 */
export enum BackgroundFetchTaskId {
  // Event dispatched automatically by react-native-background-fetch
  // Does not need to be scheduled or registered
  REACT_NATIVE_BACKGROUND_FETCH = "react-native-background-fetch",
  // Scheduled task to check if the Wallet Istance is valid
  // aftter an offline session
  ITW_WALLET_INSTANCE_CHECK = "it.pagopa.app.io.itw-wallet-instance-check"
}

export type BackgroundFetchTaskConfig = Prettify<
  TaskConfig & {
    taskId: BackgroundFetchTaskId;
  }
>;
