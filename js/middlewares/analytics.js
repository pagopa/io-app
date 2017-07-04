import { NavigationActions } from 'react-navigation'
import Mixpanel from 'react-native-mixpanel'
import { has } from 'lodash'
import { sha256 } from 'react-native-sha256'

import { APPSTATE_CHANGE, LOGIN_INTENT, LOGIN_PROVIDER, LOGIN } from '../actions'
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
    case LOGIN_INTENT: {
      Mixpanel.track('Login')
      break
    }
    case LOGIN_PROVIDER: {
      const { id, name } = result.data
      Mixpanel.trackWithProperties('Provider', {
        id,
        name,
      })
      break
    }
    case LOGIN: {
      const { idpId } = result.data
      Mixpanel.trackWithProperties('Login Success', {
        idpId,
      })
      break
    }
    case APPSTATE_CHANGE: {
      Mixpanel.track(result.data)
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
    default: {
      return result
    }
  }
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
    Mixpanel.track(nextScreen)
    // Track event with properties
    // Mixpanel.trackWithProperties(nextScreen, { button_type: 'yellow button', button_text: 'magic button' })
  }
  return result
}

module.exports = {
  injectGetState,
  actionTracking,
  screenTracking,
}
