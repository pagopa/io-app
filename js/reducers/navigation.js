// @flow

import { type NavigationState, NavigationActions } from 'react-navigation'

import { type Action } from '../actions/types'
import { USER_LOGGED_IN_ACTION, USER_LOGGED_OUT_ACTION } from '../actions/login'
import AppNavigator from '../navigation/AppNavigator'

const INITIAL_STATE = AppNavigator.router.getInitialState()

const reducer = (
  state: NavigationState = INITIAL_STATE,
  action: Action
): NavigationState => {
  switch (action.type) {
    case USER_LOGGED_IN_ACTION:
      // On user login return to the IngressScreen
      return AppNavigator.router.getInitialState()

    case USER_LOGGED_OUT_ACTION:
      // On user logout return to the IngressScreen
      return AppNavigator.router.getInitialState()

    /**
     * The getStateForAction method only accepts NavigationActions so we need to
     * check the action type.
     */
    case NavigationActions.BACK:
    case NavigationActions.INIT:
    case NavigationActions.NAVIGATE:
    case NavigationActions.RESET:
    case NavigationActions.SET_PARAMS:
      return AppNavigator.router.getStateForAction(action, state) || state

    default:
      return state
  }
}

export default reducer
