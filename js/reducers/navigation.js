// @flow

import { NavigationAction } from 'react-navigation'

import ROUTES from '../navigation/routes'
import MainNavigator from '../navigation/MainNavigator'

const INITIAL_STATE = MainNavigator.router.getStateForAction(
  MainNavigator.router.getActionForPathAndParams(ROUTES.ROUTER)
)

const reducer = (state: any = INITIAL_STATE, action: NavigationAction) => {
  const nextState = MainNavigator.router.getStateForAction(action, state)

  return nextState || state
}

export default reducer
