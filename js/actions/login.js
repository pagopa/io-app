/**
 * Implements login/logout actions.
 *
 * @flow
 */

'use strict'

import type { Action, ThunkAction, Dispatch, GetState } from './types'
import { requestUserProfile } from './user'

/**
 * Logs the user in, setting the provided auth token and SPID IdP
 */
function logIn(token: string, idpId: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: 'LOGGED_IN',
      data: {
        token,
        idpId,
      }
    })
    requestUserProfile()(dispatch, getState)
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
  logIn,
  logOut
}
