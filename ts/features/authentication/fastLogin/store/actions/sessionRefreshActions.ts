import { ActionType, createStandardAction } from "typesafe-actions";

export const areTwoMinElapsedFromLastActivity = createStandardAction(
  "ARE_TWO_MINUTES_ELAPSED_FROM_LAST_ACTIVITY"
)<{ hasTwoMinPassed: boolean }>();

export type automaticSessionRefreshActions = ActionType<
  typeof areTwoMinElapsedFromLastActivity
>;
