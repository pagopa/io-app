/**
 * Implements login/logout actions.
 */

import { Action, Thunk, Dispatch, GetState } from './types'
import { IdentityProvider } from '../utils/api'
import { requestUserProfile } from './user'
import { loadProfile } from '../store/actions/profile'

// The User is about to Login (taps on the SPID Login button)
export const USER_WILL_LOGIN_ACTION = 'USER_WILL_LOGIN_ACTION'
// The User selects the SPID Provider from the list
export const USER_SELECTED_SPID_PROVIDER_ACTION = 'USER_SELECTED_SPID_PROVIDER_ACTION'
// The User successfully performs a proper Login
export const USER_LOGGED_IN_ACTION = 'USER_LOGGED_IN_ACTION'
// An error is returned from the Login Webview
export const USER_LOGIN_ERROR_ACTION = 'USER_LOGIN_ERROR_ACTION'
// The User successfully performs a proper Logout
export const USER_LOGGED_OUT_ACTION = 'USER_LOGGED_OUT_ACTION'

/**
 * Dispatched when the user taps on SPID Login
 */
export function logInIntent(): Action {
  return {
    type: USER_WILL_LOGIN_ACTION
  }
}

/**
 * Dispatched when the user selects the SPID provider
 */
export function selectIdp(idp: IdentityProvider): Action {
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
export function logIn(token: string, idpId: string): Thunk {
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

export function logInError(error: string): Action {
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
export function logOut(): Action {
  return {
    type: USER_LOGGED_OUT_ACTION
  }
}
