/**
 * @flow
 */

'use strict'

import type { Action, ThunkAction, Dispatch, GetState } from './types'
import { requestUserProfile } from './user'

function logIn(token: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: 'LOGGED_IN',
      data: {
        token: token,
      }
    })
    requestUserProfile()(dispatch, getState)
  }
}

function logOut(): Action {
  return {
    type: 'LOGGED_OUT',
  }
}

module.exports = {
  logIn,
  logOut
}
