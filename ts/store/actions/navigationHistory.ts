import { NavigationState } from "react-navigation";
import { ActionType, createStandardAction } from "typesafe-actions";

export const navigationHistoryPush = createStandardAction(
  "NAVIGATION_HISTORY_PUSH"
)<NavigationState>();

export const navigationHistoryReset = createStandardAction(
  "NAVIGATION_HISTORY_RESET"
)();

export const navigationHistoryPop = createStandardAction(
  "NAVIGATION_HISTORY_POP"
)();

export type NavigationHistoryActions = ActionType<
  | typeof navigationHistoryPush
  | typeof navigationHistoryReset
  | typeof navigationHistoryPop
>;
