import { NavigationState } from "react-navigation";

import {
  NAVIGATION_HISTORY_POP,
  NAVIGATION_HISTORY_PUSH,
  NAVIGATION_HISTORY_RESET
} from "./constants";

type NavigationHistoryPush = {
  type: typeof NAVIGATION_HISTORY_PUSH;
  payload: NavigationState;
};

type NavigationHistoryReset = {
  type: typeof NAVIGATION_HISTORY_RESET;
};

type NavigationHistoryPop = {
  type: typeof NAVIGATION_HISTORY_POP;
};

export type NavigationHistoryActions =
  | NavigationHistoryPush
  | NavigationHistoryReset
  | NavigationHistoryPop;

// Creators
export const navigationHistoryPushAction = (
  navigationState: NavigationState
): NavigationHistoryPush => ({
  type: NAVIGATION_HISTORY_PUSH,
  payload: navigationState
});

export const navigationHistoryResetAction = (): NavigationHistoryReset => ({
  type: NAVIGATION_HISTORY_RESET
});

export const navigationHistoryPopAction = (): NavigationHistoryPop => ({
  type: NAVIGATION_HISTORY_POP
});
