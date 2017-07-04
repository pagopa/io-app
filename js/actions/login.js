/**
 * Implements login/logout actions.
 *
 * @flow
 */

'use strict'

import type { Action, ThunkAction, Dispatch, GetState } from './types'
import { requestUserProfile } from './user'

// The User is about to Login (taps on the SPID Login button)
const LOG_IN_INTENT = 'LOG_IN_INTENT'
// The User selects the SPID Provider from the list
const SPID_PROVIDER = 'SPID_PROVIDER'
// The User successfully performs a proper Login
const LOGGED_IN = 'LOGGED_IN'
// An error is returned from the Login Webview
const LOG_IN_ERROR = 'LOG_IN_ERROR'

/**
 * Dispatched when the user taps on SPID Login
 */
function logInIntent(): Action {
  return {
    type: LOG_IN_INTENT,
  }
}

/**
 * Dispatched when the user selects the SPID provider
 */
function selectIdp(idp: IdentityProvider): Action {
  return {
    type: SPID_PROVIDER,
    data: idp
  }
}

/**
 * Logs the user in, setting the provided auth token and SPID IdP
 */
function logIn(token: string, idpId: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: LOGGED_IN,
      data: {
        token,
        idpId,
      }
    })
    requestUserProfile()(dispatch, getState)
  }
}

function logInError(error: string): Action {
  return {
    type: LOG_IN_ERROR,
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
    type: 'LOGGED_OUT',
  }
}

module.exports = {
  logInIntent,
  selectIdp,
  logIn,
  logInError,
  logOut,

  LOG_IN_INTENT,
  SPID_PROVIDER,
  LOGGED_IN,
  LOG_IN_ERROR,
}
