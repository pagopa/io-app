import { getType } from "typesafe-actions";
import {
  setDebugCurrentRouteName,
  setDebugModeEnabled
} from "../actions/debug";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type DebugState = Readonly<{
  isDebugModeEnabled: boolean;
  currentRoute: string;
}>;

const INITIAL_STATE: DebugState = {
  isDebugModeEnabled: false,
  currentRoute: "Unknown"
};

export function debugReducer(
  state: DebugState = INITIAL_STATE,
  action: Action
): DebugState {
  switch (action.type) {
    case getType(setDebugModeEnabled):
      return {
        ...state,
        isDebugModeEnabled: action.payload
      };
    case getType(setDebugCurrentRouteName):
      return {
        ...state,
        currentRoute: action.payload
      };
  }

  return state;
}

// Selector
export const isDebugModeEnabledSelector = (state: GlobalState) =>
  state.debug.isDebugModeEnabled;

/**
 * For debug purpose only
 * @deprecated Don't use this selector to create new application logic, will be removed after the upgrade to react-navigation v6
 * @param state
 */
export const currentRouteDebugSelector = (state: GlobalState) =>
  state.debug.currentRoute;
