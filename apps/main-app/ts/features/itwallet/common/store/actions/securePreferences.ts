import { ActionType, createStandardAction } from "typesafe-actions";

export const itwOfflineAccessCounterUp = createStandardAction(
  "ITW_OFFLINE_ACCESS_COUNTER_UP"
)();
export const itwOfflineAccessCounterReset = createStandardAction(
  "ITW_OFFLINE_ACCESS_COUNTER_RESET"
)();

export const itwUnverifiedCredentialsCounterUp = createStandardAction(
  "ITW_UNVERIFIED_CREDENTIALS_COUNTER_UP"
)();
export const itwUnverifiedCredentialsCounterReset = createStandardAction(
  "ITW_UNVERIFIED_CREDENTIALS_COUNTER_RESET"
)();

export type ItwSecurePreferencesActions =
  | ActionType<typeof itwOfflineAccessCounterReset>
  | ActionType<typeof itwOfflineAccessCounterUp>
  | ActionType<typeof itwUnverifiedCredentialsCounterReset>
  | ActionType<typeof itwUnverifiedCredentialsCounterUp>;
