/**
 * Implements a Redux middleware that translates actions into Mixpanel events
 *
 */

import { NavigationActions } from 'react-navigation'
import Mixpanel from 'react-native-mixpanel'
import { has } from 'lodash'
import { sha256 } from 'react-native-sha256'

import {
  APPLICATION_STATE_CHANGE_ACTION,
  USER_WILL_LOGIN_ACTION,
  USER_SELECTED_SPID_PROVIDER_ACTION,
  USER_LOGGED_IN_ACTION,
  USER_LOGIN_ERROR_ACTION
} from '../actions'
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
      Mixpanel.trackWithProperties('APPLICATION_STATE_CHANGE', {
        'APPLICATION_STATE_NAME': result.namebreak})
      break
    }
    case USER_WILL_LOGIN_ACTION: {
      Mixpanel.track('USER_WILL_LOGIN')
      break
    }
    case USER_SELECTED_SPID_PROVIDER_ACTION: {
      const { id, name } = result.data.idp
      Mixpanel.trackWithProperties('USER_SELECTED_SPID_PROVIDER', {
        id,
        name,
      })
      break
    }
    case USER_LOGGED_IN_ACTION: {
      const { idpId } = result.data
      Mixpanel.trackWithProperties('USER_LOGGED_IN', {
        idpId,
      })
      break
    }
    case USER_LOGIN_ERROR_ACTION: {
      const { error } = result.data
      Mixpanel.trackWithProperties('USER_LOGIN_ERROR', {
        error,
      })
      break
    }
    case persist.REHYDRATE: {
      if (!has(result, 'payload.user.profile.fiscalnumber')) {
        break
      }

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
    Mixpanel.trackWithProperties('SCREEN_CHANGE', {
      'SCREEN_NAME': nextScreen,
    })
  }
  return result
}

module.exports = {
  injectGetState,
  actionTracking,
  screenTracking,
}
