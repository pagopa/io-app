/**
 * Implements the user state reducers.
 *
 * Handles login, logout and user profile actions.
 *
 * @flow
 */

'use strict'

import type { Action } from '../actions/types'
import type { ApiUserProfile } from '../utils/api'

// user state when logged out
export type LoggedOutUserState = {
  isLoggedIn: false,
  apiUrlPrefix: string,
}

// user state when logged in
export type LoggedInUserState = {
  isLoggedIn: true,
  apiUrlPrefix: string,
  token: string,
  idpId: string,
  profile?: ApiUserProfile,
}

// combined user state
export type UserState = LoggedOutUserState | LoggedInUserState

// initial user state
const initialUserState: LoggedOutUserState = {
  isLoggedIn: false,
  // TODO move URL to config js
  apiUrlPrefix: 'https://spid-test.spc-app1.teamdigitale.it',
}

/**
 * Reducer for the user state
 */
export default function user(state: UserState = initialUserState, action: Action): UserState {

  // on login, save token and IdP
  if (action.type === 'LOGGED_IN' && state.isLoggedIn === false) {
    return {
      isLoggedIn: true,
      apiUrlPrefix: state.apiUrlPrefix,
      token: action.data.token,
      idpId: action.data.idpId,
    }
  }

  // on logout, reset state
  if (action.type === 'LOGGED_OUT' && state.isLoggedIn === true) {
    return initialUserState
  }

  // on receive of user profile data, save in the use state
  if(action.type === 'RECEIVE_USER_PROFILE' && state.isLoggedIn === true) {
    return {
      isLoggedIn: true,
      apiUrlPrefix: state.apiUrlPrefix,
      token: state.token,
      idpId: state.idpId,
      profile: action.profile,
    }
  }

  return state
}
