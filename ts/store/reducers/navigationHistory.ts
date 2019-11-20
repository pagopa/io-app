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

// Selector

// A selector to read the current routeMane and chack if it is the main one
export const isOnboardingCompletedSelector = (state: GlobalState) =>
  state.nav.routes[0].routeName === ROUTES.MAIN;

export default reducer;
