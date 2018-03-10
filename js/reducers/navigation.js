// @flow

import type { NavigationState, NavigationAction } from 'react-navigation'

import MainNavigator from '../navigation/MainNavigator'

const reducer = (state: NavigationState, action: NavigationAction) => {
  const nextState = MainNavigator.router.getStateForAction(action, state)

  return nextState || state
}

export default reducer
