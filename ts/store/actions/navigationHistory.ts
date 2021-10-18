import { NavigationState } from "react-navigation";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

export const navigationHistoryPush = createStandardAction(
  "NAVIGATION_HISTORY_PUSH"
)<NavigationState>();

export const navigationHistoryReset = createStandardAction(
  "NAVIGATION_HISTORY_RESET"
)();

export const navigationHistoryPop = createAction(
  "NAVIGATION_HISTORY_POP",
  action =>
    (howMany: number = 1) =>
      action(howMany)
);

export type NavigationHistoryActions = ActionType<
  | typeof navigationHistoryPush
  | typeof navigationHistoryReset
  | typeof navigationHistoryPop
>;
