/**
 * A reducer to handle the navigation history
 */

import { NavigationState } from "react-navigation";

import {
  NAVIGATION_HISTORY_POP,
  NAVIGATION_HISTORY_PUSH,
  NAVIGATION_HISTORY_RESET
} from "../actions/constants";
import { Action } from "../actions/types";

export type NavigationHistoryState = ReadonlyArray<NavigationState>;

const INITIAL_STATE: NavigationHistoryState = [];

const reducer = (
  state: NavigationHistoryState = INITIAL_STATE,
  action: Action
): NavigationHistoryState => {
  switch (action.type) {
    case NAVIGATION_HISTORY_PUSH:
      return [...state, action.payload];

    case NAVIGATION_HISTORY_RESET:
      return INITIAL_STATE;

    case NAVIGATION_HISTORY_POP:
      return state.slice(0, -1);

    default:
      return state;
  }
};

export default reducer;
