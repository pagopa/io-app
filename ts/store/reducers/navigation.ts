import { getType } from "typesafe-actions";
import { setDebugCurrentRouteName } from "../actions/debug";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type NavigationState = {
  currentRoute: string;
};

const INITIAL_STATE: NavigationState = {
  currentRoute: "n/a"
};

export function navigationReducer(
  state: NavigationState = INITIAL_STATE,
  action: Action
): NavigationState {
  switch (action.type) {
    case getType(setDebugCurrentRouteName):
      return {
        ...state,
        currentRoute: action.payload
      };
  }

  return state;
}

/**
 * For debug / backwards compatibility purpose only
 * @deprecated Don't use this selector to create new application logic, will be removed after the upgrade to react-navigation v6
 * @param state
 */
export const currentRouteDebugSelector = (state: GlobalState) =>
  state.navigation.currentRoute;
