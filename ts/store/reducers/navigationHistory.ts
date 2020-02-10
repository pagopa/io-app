/**
 * A reducer to handle the navigation history
 */

import { NavigationState } from "react-navigation";
import { getType } from "typesafe-actions";
import ROUTES from "../../navigation/routes";
import {
  navigationHistoryPop,
  navigationHistoryPush,
  navigationHistoryReset
} from "../actions/navigationHistory";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type NavigationHistoryState = ReadonlyArray<NavigationState>;

const INITIAL_STATE: NavigationHistoryState = [];

const reducer = (
  state: NavigationHistoryState = INITIAL_STATE,
  action: Action
): NavigationHistoryState => {
  switch (action.type) {
    case getType(navigationHistoryPush):
      return [...state, action.payload];

    case getType(navigationHistoryReset):
      return INITIAL_STATE;

    case getType(navigationHistoryPop):
      return state.slice(0, -action.payload);

    default:
      return state;
  }
};

// Selectors

// A selector to read the current route name and check if it is the main one
export const isOnboardingCompletedSelector = (state: GlobalState) =>
  state.nav.routes.length > 0 && state.nav.routes[0].routeName === ROUTES.MAIN;

export const navSelector = (state: GlobalState) => state.nav;

export default reducer;
