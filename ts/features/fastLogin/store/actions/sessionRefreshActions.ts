import { ActionType, createStandardAction } from "typesafe-actions";

export const setAutomaticSessionRefresh = createStandardAction(
  "SET_AUTOMATIC_SESSION_REFRESH_AFTER_TWO_MIN_BACKGROUND"
)<{ enabled: boolean | undefined }>();

export const areTwoMinElapsedFromLastActivity = createStandardAction(
  "ARE_TWO_MINUTES_ELAPSED_FROM_LAST_ACTIVITY"
)<{ hasTwoMinPassed: boolean }>();

export type automaticSessionRefreshActions = ActionType<
  typeof setAutomaticSessionRefresh | typeof areTwoMinElapsedFromLastActivity
>;
