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
  USER_LOGIN_ERROR_ACTION,
  RECEIVE_USER_PROFILE_ACTION
} from '../actions'
import type { ApiUserProfile } from '../utils/api'

import config from '../config'

// user state when logged out
export type DefaultLoggedOutUserState = {
  isLoggedIn: false,
  isError: false,
  apiUrlPrefix: string
}

// user state when there is an error, tracing by isError=true
export type ErrorLoggedOutUserState = {
  isLoggedIn: false,
  isError: true,
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
export type UserState =
  | DefaultLoggedOutUserState
  | LoggedInUserState
  | ErrorLoggedOutUserState

// initial user state
export const initialUserState: DefaultLoggedOutUserState = {
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
      isError: false,
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

  if (action.type === USER_LOGIN_ERROR_ACTION && state.isLoggedIn === false) {
    return {
      isLoggedIn: false,
      isError: true,
      errorMessage: action.data.error
    }
  }

  return state
}
