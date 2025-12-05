import { ActionType, createStandardAction } from "typesafe-actions";

export const itwOfflineAccessCounterUp = createStandardAction(
  "ITW_OFFLINE_ACCESS_COUNTER_UP"
)();
export const itwOfflineAccessCounterReset = createStandardAction(
  "ITW_OFFLINE_ACCESS_COUNTER_RESET"
)();

export const itwAvailableCredentialsCounterUp = createStandardAction(
  "ITW_AVAILABLE_CREDENTIALS_COUNTER_UP"
)();
export const itwAvailableCredentialsCounterReset = createStandardAction(
  "ITW_AVAILABLE_CREDENTIALS_COUNTER_RESET"
)();

export type ItwSecurePreferencesActions =
  | ActionType<typeof itwOfflineAccessCounterUp>
  | ActionType<typeof itwOfflineAccessCounterReset>
  | ActionType<typeof itwAvailableCredentialsCounterUp>
  | ActionType<typeof itwAvailableCredentialsCounterReset>;
