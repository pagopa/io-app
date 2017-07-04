/**
 * Implements login/logout actions.
 *
 * @flow
 */

'use strict'

import type { Action, ThunkAction, Dispatch, GetState } from './types'
import { requestUserProfile } from './user'

const LOGIN = 'LOGGED_IN'
const LOGIN_INTENT = 'LOG_IN_INTENT'
const LOGIN_PROVIDER = 'LOG_IN_PROVIDER'
const LOGIN_ERROR = 'LOG_IN_ERROR'

/**
 * Dispatched when the user taps on SPID Login
 */
function logInIntent(): Action {
  return {
    type: LOGIN_INTENT,
  }
}

/**
 * Dispatched when the user selects the SPID provider
 */
function selectIdpidp(idp: Object): Action {
  return {
    type: LOGIN_PROVIDER,
    data: idp
  }
}

/**
 * Logs the user in, setting the provided auth token and SPID IdP
 */
function logIn(token: string, idpId: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: LOGIN,
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
    type: LOGIN_ERROR,
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
  selectIdpidp,
  logIn,
  logInError,
  logOut,

  LOGIN_INTENT,
  LOGIN_PROVIDER,
  LOGIN,
  LOGIN_ERROR,
}
