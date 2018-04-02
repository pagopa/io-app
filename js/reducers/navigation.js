// @flow

import { type NavigationState, NavigationActions } from 'react-navigation'

import { type Action } from '../actions/types'
import { USER_LOGGED_IN_ACTION, USER_LOGGED_OUT_ACTION } from '../actions/login'
import { LOGIN_SUCCESS } from '../store/actions/constants'
import AppNavigator from '../navigation/AppNavigator'

const INITIAL_STATE: NavigationState = AppNavigator.router.getInitialState()

function nextState(state: NavigationState, action: Action): ?NavigationState {
  switch (action.type) {
    // On user login or logout return to the IngressScreen
    case USER_LOGGED_IN_ACTION:
    case LOGIN_SUCCESS:
    case USER_LOGGED_OUT_ACTION:
      return INITIAL_STATE

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
