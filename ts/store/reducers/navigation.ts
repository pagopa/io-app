import {
  NavigationActions,
  NavigationRoute,
  NavigationState,
  StackActions
} from "react-navigation";

import AppNavigator from "../../navigation/AppNavigator";
import { NAVIGATION_RESTORE } from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export const INITIAL_STATE: NavigationState = AppNavigator.router.getStateForAction(
  NavigationActions.init()
);

// Selectors

export const navigationStateSelector = (state: GlobalState): NavigationState =>
  state.nav;

const getCurrentRouteFromState = (route: NavigationState): NavigationState => {
  if (route.index) {
    const currentRoute = route.routes[route.index];
    return getCurrentRouteFromState(currentRoute as NavigationState);
  }

  return route;
};

export const currentRouteSelector = ({ nav }: GlobalState) =>
  getCurrentRouteFromState(nav) as NavigationRoute;

function nextState(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    /**
     * The getStateForAction method only accepts NavigationActions so we need to
     * check the action type.
     */
    case NavigationActions.BACK:
    case NavigationActions.INIT:
    case NavigationActions.NAVIGATE:
    case NavigationActions.SET_PARAMS:
    case StackActions.RESET:
    case StackActions.REPLACE:
    case StackActions.POP_TO_TOP:
      return AppNavigator.router.getStateForAction(action, state);

    // Used to restore a saved navigation state
    case NAVIGATION_RESTORE:
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
