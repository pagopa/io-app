import { NavigationActions, NavigationState } from "react-navigation";

import AppNavigator from "../../navigation/AppNavigator";
import { NAVIGATION_RESTORE } from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

const INITIAL_STATE: NavigationState = AppNavigator.router.getStateForAction(
  NavigationActions.init()
);

// Selectors

export const navigationStateSelector = (state: GlobalState) => state.nav;

function nextState(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    /**
     * The getStateForAction method only accepts NavigationActions so we need to
     * check the action type.
     */
    case NavigationActions.BACK:
    case NavigationActions.INIT:
    case NavigationActions.NAVIGATE:
    case NavigationActions.RESET:
    case NavigationActions.SET_PARAMS:
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
