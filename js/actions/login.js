/**
 * Implements login/logout actions.
 *
 * @flow
 */

'use strict'

import type { Action, ThunkAction, Dispatch, GetState } from './types'
import type { IdentityProvider, ApiUserProfile } from '../utils/api'
import { requestUserProfile, receiveUserProfile } from './user'

// The User is about to Login (taps on the SPID Login button)
const USER_WILL_LOGIN_ACTION = 'USER_WILL_LOGIN_ACTION'
// The User selects the SPID Provider from the list
const USER_SELECTED_SPID_PROVIDER_ACTION = 'USER_SELECTED_SPID_PROVIDER_ACTION'
// The User successfully performs a proper Login
const USER_LOGGED_IN_ACTION = 'USER_LOGGED_IN_ACTION'
// An error is returned from the Login Webview
const USER_LOGIN_ERROR_ACTION = 'USER_LOGIN_ERROR_ACTION'
// The User successfully performs a proper Logout
const USER_LOGGED_OUT_ACTION = 'USER_LOGGED_OUT_ACTION'

/**
 * Dispatched when the user taps on SPID Login
 */
function logInIntent(): Action {
  return {
    type: USER_WILL_LOGIN_ACTION,
  }
}

/**
 * Dispatched when the user selects the SPID provider
 */
function selectIdp(idp: IdentityProvider): Action {
  return {
    type: USER_SELECTED_SPID_PROVIDER_ACTION,
    data: {
      idp
    }
  }
}

/**
 * Dispatched when the user selects the SPID demo provider
 */
function selectDemo(idp: IdentityProvider): Action {
  return {
    type: USER_SELECTED_SPID_PROVIDER_ACTION,
    data: {
      idp
    }
  }
}

/**
 * Logs the user in, setting the provided auth token and SPID IdP
 */
function logIn(token: string, idpId: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: USER_LOGGED_IN_ACTION,
      data: {
        token,
        idpId,
      }
    })
    requestUserProfile()(dispatch, getState)
  }
}

/**
 * Logs the user with 'demo' profile
 */
function logInDemo(profile: ApiUserProfile): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: USER_LOGGED_IN_ACTION,
      data: {
        token: profile.token,
        idpId: profile.spid_idp,
      }
    })
    receiveUserProfile(profile)(dispatch, getState)
  }
}

function logInError(error: string): Action {
  return {
    type: USER_LOGIN_ERROR_ACTION,
    data: {
      error,
    }
  }
}

/**
 * Logs the user out
 */
function logOut(): Action {
  return {
    type: USER_LOGGED_OUT_ACTION,
  }
}

module.exports = {
  logInIntent,
  selectIdp,
  selectDemo,
  logIn,
  logInDemo,
  logInError,
  logOut,

  USER_WILL_LOGIN_ACTION,
  USER_SELECTED_SPID_PROVIDER_ACTION,
  USER_LOGGED_IN_ACTION,
  USER_LOGIN_ERROR_ACTION,
}
