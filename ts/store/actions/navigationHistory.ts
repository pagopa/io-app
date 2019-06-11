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

export const navigationHistoryMultiplePop = createStandardAction(
  "NAVIGATION_HISTORY_MULTIPLE_POP"
)<number>();

export type NavigationHistoryActions = ActionType<
  // tslint:disable-next-line: max-union-size
  | typeof navigationHistoryPush
  | typeof navigationHistoryReset
  | typeof navigationHistoryPop
  | typeof navigationHistoryMultiplePop
>;
