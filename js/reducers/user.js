/**
 * @flow
 */

'use strict'

import type { Action } from '../actions/types'

export type UserState = {
  isLoggedIn: boolean,
  apiUrlPrefix: string,
  token: ?string,
  name?: ?string,
};

const initialUserState = {
  isLoggedIn: false,
  apiUrlPrefix: 'https://spid-test.spc-app1.teamdigitale.it',
  token: null,
  name: null,
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
    let { name } = action.profile
    return {
      ...state,
      name,
    }
  }

  return state
}

module.exports = user
