/**
 * Implements login/logout actions.
 *
 * @flow
 */

import type { Action, Thunk, Dispatch, GetState } from './types'
import type { IdentityProvider } from '../utils/api'
import { requestUserProfile } from './user'
import { loadProfile } from '../store/actions/profile'

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
    type: USER_WILL_LOGIN_ACTION
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
 * Logs the user in, setting the provided auth token and SPID IdP
 */
function logIn(token: string, idpId: string): Thunk {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: USER_LOGGED_IN_ACTION,
      data: {
        token,
        idpId
      }
    })
    requestUserProfile()(dispatch, getState)
    // TODO: Saga test: remove this before merging into master
    dispatch(loadProfile())
  }
}

function logInError(error: string): Action {
  return {
    type: USER_LOGIN_ERROR_ACTION,
    data: {
      error
    }
  }
}

/**
 * Logs the user out
 */
function logOut(): Action {
  return {
    type: USER_LOGGED_OUT_ACTION
  }
}

module.exports = {
  logInIntent,
  selectIdp,
  logIn,
  logInError,
  logOut,

  USER_WILL_LOGIN_ACTION,
  USER_SELECTED_SPID_PROVIDER_ACTION,
  USER_LOGGED_IN_ACTION,
  USER_LOGIN_ERROR_ACTION,
  USER_LOGGED_OUT_ACTION
}
