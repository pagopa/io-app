/**
 * Implements a Redux middleware that translates actions into Mixpanel events.
 *
 */

import { NavigationActions } from 'react-navigation'
import Mixpanel from 'react-native-mixpanel'
import { has } from 'lodash'
import { sha256 } from 'react-native-sha256'

import { APPLICATION_STATE_CHANGE_ACTION } from '../actions'
import * as persist from 'redux-persist/constants'

/*
  The middleware injects the `getState` method (from the store) into the action
  `getState` is later exposed on the action i.e. while working on reducers
*/
const injectGetState = ({ getState }) => (next) => (action) => {
  next({
    ...action,
    getState: getState
  })
}

/*
  The middleware acts as a general hook in order to track any meaningful action
*/
const actionTracking = (store) => (next) => (action) => {
  let result = next(action)

  switch (action.type) {
    case APPLICATION_STATE_CHANGE_ACTION: {
      Mixpanel.trackWithProperties('application_state_change', {
        'application_state_name': result.name,
      })
      break
    }
    case persist.REHYDRATE: {
      if (!has(result, 'payload.user.profile.fiscalnumber')) break

      const { fiscalnumber } = result.payload.user.profile
      sha256(fiscalnumber).then((hash) => {
        Mixpanel.identify(hash)
        Mixpanel.set({
          'fiscalnumber': hash,
        })
      })
      break
    }
  }

  return result
}

// gets the current screen from navigation state
function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  // dive into nested navigators
  if (route.routes) {
    return getCurrentRouteName(route)
  }
  return route.routeName
}

/*
  The middleware acts as a general hook in order to track any meaningful navigation action
  https://reactnavigation.org/docs/guides/screen-tracking#Screen-tracking-with-Redux
*/
const screenTracking = ({ getState }) => (next) => (action) => {
  if (
    action.type !== NavigationActions.NAVIGATE
    && action.type !== NavigationActions.BACK
  ) {
    return next(action)
  }

  const currentScreen = getCurrentRouteName(getState().nav)
  const result = next(action)
  const nextScreen = getCurrentRouteName(getState().nav)

  if (nextScreen !== currentScreen) {
    Mixpanel.trackWithProperties('screen_change', {
      'screen_name': nextScreen,
    })
  }
  return result
}

module.exports = {
  injectGetState,
  actionTracking,
  screenTracking,
}
