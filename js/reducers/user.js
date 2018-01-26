/**
 * Implements the user state reducers.
 *
 * Handles login, logout and user profile actions.
 *
 * @flow
 */

'use strict'

import type { Action } from '../actions/types'
import {
  USER_LOGGED_IN_ACTION,
  USER_LOGGED_OUT_ACTION,
  RECEIVE_USER_PROFILE_ACTION,
  RECEIVE_UPDATE_USER_PROFILE_ACTION
} from '../actions'
import type { ApiUserProfile } from '../utils/api'

import config from '../config'

// user state when logged out
export type LoggedOutUserState = {
  isLoggedIn: false,
  apiUrlPrefix: string
}

// user state when logged in
export type LoggedInUserState = {
  isLoggedIn: true,
  apiUrlPrefix: string,
  token: string,
  idpId: string,
  profile?: ApiUserProfile
}

// combined user state
export type UserState = LoggedOutUserState | LoggedInUserState

// initial user state
const initialUserState: LoggedOutUserState = {
  isLoggedIn: false,
  // TODO move URL to config js
  apiUrlPrefix: config.apiUrlPrefix
}

/**
 * Reducer for the user state
 */
export default function user(
  state: UserState = initialUserState,
  action: Action
): UserState {
  // on login, save token and IdP
  if (action.type === USER_LOGGED_IN_ACTION && state.isLoggedIn === false) {
    return {
      isLoggedIn: true,
      apiUrlPrefix: state.apiUrlPrefix,
      token: action.data.token,
      idpId: action.data.idpId
    }
  }

  // on logout, reset state
  if (action.type === USER_LOGGED_OUT_ACTION && state.isLoggedIn === true) {
    return initialUserState
  }

  // on receive of user profile data, save in the use state
  if (
    action.type === RECEIVE_USER_PROFILE_ACTION &&
    state.isLoggedIn === true
  ) {
    return {
      isLoggedIn: true,
      apiUrlPrefix: state.apiUrlPrefix,
      token: state.token,
      idpId: state.idpId,
      profile: action.profile
    }
  }

  return state
}
