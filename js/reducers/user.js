/**
 * @flow
 */

'use strict'

import type { Action } from '../actions/types'
import type { ApiUserProfile } from '../utils/api'

export type UserState = {
  isLoggedIn: boolean,
  apiUrlPrefix: string,
  token?: ?string,
  profile?: ApiUserProfile,
};

const initialUserState = {
  isLoggedIn: false,
  apiUrlPrefix: 'https://spid-test.spc-app1.teamdigitale.it',
}

function user(state: UserState = initialUserState, action: Action): UserState {

  if (action.type === 'LOGGED_IN') {
    let { token } = action.data
    return {
      ...state,
      isLoggedIn: true,
      token,
    }
  }

  if (action.type === 'LOGGED_OUT') {
    return initialUserState
  }

  if(action.type === 'RECEIVE_USER_PROFILE') {
    return {
      ...state,
      profile: action.profile,
    }
  }

  return state
}

module.exports = user
