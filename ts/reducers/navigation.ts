import { NavigationState, NavigationActions } from 'react-navigation'

import { Action } from '../actions/types'
import AppNavigator from '../navigation/AppNavigator'

const INITIAL_STATE: NavigationState = AppNavigator.router.getStateForAction(
  NavigationActions.init()
)

function nextState(
  state: NavigationState,
  action: Action
): NavigationState | null {
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
      return AppNavigator.router.getStateForAction(action, state)

    default:
      return null
  }
}

const reducer = (
  state: NavigationState = INITIAL_STATE,
  action: Action
): NavigationState => {
  return nextState(state, action) || state
}

export default reducer
