/**
 * A reducer to handle the navigation history
 */

import { NavigationState } from "react-navigation";
import { getType } from "typesafe-actions";

import {
  navigationHistoryPop,
  navigationHistoryPush,
  navigationHistoryReset
} from "../actions/navigationHistory";
import { Action } from "../actions/types";

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
      return state.slice(0, -1);

    default:
      return state;
  }
};

export default reducer;
