import { NavigationActions } from 'react-navigation'
import Mixpanel from 'react-native-mixpanel'
import { has } from 'lodash'
import { sha256 } from 'react-native-sha256'

import * as persist from 'redux-persist/constants'

const injectGetState = ({ getState }) => (next) => (action) => {
  next({
    ...action,
    getState: getState
  })
}

const actionTracking = (store) => (next) => (action) => {
  let result = next(action)
  switch (action.type) {
    case persist.REHYDRATE: {
      if (!has(result, 'payload.user.profile.fiscalnumber')) break

      const { fiscalnumber } = result.payload.user.profile
      sha256(fiscalnumber).then((hash) => {
        Mixpanel.identify(hash)
        Mixpanel.set({
          '$email': hash,
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
    //Track event with properties
    // Mixpanel.trackWithProperties('Click Button', {button_type: 'yellow button', button_text: 'magic button'})
  }
  return result
}

module.exports = {
  injectGetState,
  actionTracking,
  screenTracking,
}
