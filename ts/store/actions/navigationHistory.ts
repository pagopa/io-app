import { NavigationState } from "react-navigation";

import {
  NAVIGATION_HISTORY_BACK,
  NAVIGATION_HISTORY_RESET,
  NAVIGATION_HISTORY_UPDATE
} from "./constants";

type NavigationHistoryUpdate = {
  type: typeof NAVIGATION_HISTORY_UPDATE;
  payload: NavigationState;
};

type NavigationHistoryReset = {
  type: typeof NAVIGATION_HISTORY_RESET;
};

type NavigationHistoryBack = {
  type: typeof NAVIGATION_HISTORY_BACK;
};

export type NavigationHistoryActions =
  | NavigationHistoryUpdate
  | NavigationHistoryReset
  | NavigationHistoryBack;

// Creators
export const navigationHistoryUpdateAction = (
  navigationState: NavigationState
): NavigationHistoryUpdate => ({
  type: NAVIGATION_HISTORY_UPDATE,
  payload: navigationState
});

export const navigationHistoryResetAction = (): NavigationHistoryReset => ({
  type: NAVIGATION_HISTORY_RESET
});

export const navigationHistoryBackAction = (): NavigationHistoryBack => ({
  type: NAVIGATION_HISTORY_BACK
});
