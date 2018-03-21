/**
 * Implements a Redux middleware that translates actions into Mixpanel events
 *
 * @flow
 */

import Mixpanel from 'react-native-mixpanel'
import {
  type NavigationState,
  type NavigationLeafRoute,
  NavigationActions
} from 'react-navigation'
import { has } from 'lodash'
import { sha256 } from 'react-native-sha256'
import { REHYDRATE } from 'redux-persist/lib/constants'

import {
  USER_WILL_LOGIN_ACTION,
  USER_SELECTED_SPID_PROVIDER_ACTION,
  USER_LOGGED_IN_ACTION,
  USER_LOGIN_ERROR_ACTION
} from '../actions'
import {
  type MiddlewareAPI,
  type Action,
  type AnyAction,
  type Thunk,
  type Dispatch
} from '../actions/types'
import { APP_STATE_CHANGE_ACTION } from '../store/actions/constants'

/*
  The middleware acts as a general hook in order to track any meaningful action
*/
function actionTracking(): Dispatch => AnyAction => AnyAction {
  return (next: Dispatch): (AnyAction => AnyAction) => {
    return (action: AnyAction): AnyAction => {
      const result: Action | Thunk = next(action)

      if (typeof action === 'function') {
        return result
      }

      switch (result.type) {
        case APP_STATE_CHANGE_ACTION: {
          Mixpanel.trackWithProperties('APP_STATE_CHANGE', {
            APPLICATION_STATE_NAME: result.payload
          })
          break
        }
        case USER_WILL_LOGIN_ACTION: {
          Mixpanel.track('USER_WILL_LOGIN')
          break
        }
        case USER_SELECTED_SPID_PROVIDER_ACTION: {
          const { id, name } = result.data.idp
          Mixpanel.trackWithProperties('USER_SELECTED_SPID_PROVIDER', {
            SPID_IDP_ID: id,
            SPID_IDP_NAME: name
          })
          break
        }
        case USER_LOGGED_IN_ACTION: {
          const { idpId } = result.data
          Mixpanel.trackWithProperties('USER_LOGGED_IN', {
            SPID_IDP_ID: idpId
          })
          break
        }
        case USER_LOGIN_ERROR_ACTION: {
          const { error } = result.data
          Mixpanel.trackWithProperties('USER_LOGIN_ERROR', {
            error
          })
          break
        }
        case REHYDRATE: {
          if (!has(result, 'payload.user.profile.fiscalnumber')) {
            break
          }

          const { fiscalnumber } = result.payload.user.profile
          sha256(fiscalnumber).then(hash => {
            Mixpanel.identify(hash)
            Mixpanel.set({
              fiscalnumber: hash
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
  }
}

// gets the current screen from navigation state
// TODO: Need to be fixed
function getCurrentRouteName(
  navNode: NavigationState | NavigationLeafRoute
): ?string {
  if (!navNode) {
    return null
  }

  if (typeof navNode.routeName === 'string') {
    // navNode is a NavigationLeafRoute
    return navNode.routeName
  }

  // navNode is a NavigationState
  // eslint-disable-next-line flowtype/no-weak-types
  const x = 'ciao'
  const navState = ((navNode: any): NavigationState)
  const route = navState.routes[navState.index]
  return getCurrentRouteName(route)
}

/*
  The middleware acts as a general hook in order to track any meaningful navigation action
  https://reactnavigation.org/docs/guides/screen-tracking#Screen-tracking-with-Redux
*/
function screenTracking(
  store: MiddlewareAPI
): Dispatch => AnyAction => AnyAction {
  return (next: Dispatch): (AnyAction => AnyAction) => {
    return (action: AnyAction): AnyAction => {
      if (
        action.type !== NavigationActions.NAVIGATE &&
        action.type !== NavigationActions.BACK
      ) {
        return next(action)
      }

      const currentScreen = getCurrentRouteName(store.getState().navigation)
      const result = next(action)
      const nextScreen = getCurrentRouteName(store.getState().navigation)

      if (nextScreen !== currentScreen) {
        Mixpanel.trackWithProperties('SCREEN_CHANGE', {
          SCREEN_NAME: nextScreen
        })
      }
      return result
    }
  }
}

module.exports = {
  actionTracking,
  screenTracking
}
