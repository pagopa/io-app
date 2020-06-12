import {
  NavigationActions,
  NavigationState,
  StackActions
} from "react-navigation";
import { getType } from "typesafe-actions";

import { index } from "fp-ts/lib/Array";
import { none, Option } from "fp-ts/lib/Option";
import AppNavigator from "../../navigation/AppNavigator";
import { getRouteName } from "../../utils/navigation";
import { navigationRestore } from "../actions/navigation";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

const INITIAL_STATE: NavigationState = AppNavigator.router.getStateForAction(
  NavigationActions.init()
);

// Selectors
export const navigationStateSelector = (state: GlobalState): NavigationState =>
  state.nav;

// if some, it returns the name of the current route
export const navigationCurrentRouteSelector = (
  state: GlobalState
): Option<string> => {
  return index(state.nav.index, [...state.nav.routes]).fold(none, ln =>
    getRouteName(ln.routes[ln.index])
  );
};

function nextState(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    /**
     * The getStateForAction method only accepts NavigationActions so we need to
     * check the action type.
     */
    case NavigationActions.INIT:
    case NavigationActions.NAVIGATE:
    case NavigationActions.SET_PARAMS:
    case StackActions.RESET:
    case StackActions.REPLACE:
    case StackActions.POP_TO_TOP:
    case StackActions.COMPLETE_TRANSITION:
      return AppNavigator.router.getStateForAction(action, state);

    // Used to restore a saved navigation state
    case getType(navigationRestore):
      return { ...action.payload };

    default:
      return state;
  }
}

const reducer = (
  state: NavigationState = INITIAL_STATE,
  action: Action
): NavigationState => {
  return nextState(state, action) || state;
};

export default reducer;
