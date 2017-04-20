/**
 * @flow
 */

'use strict'

import type { Action } from '../actions/types'

export type UserState = {
  isLoggedIn: boolean,
  apiUrlPrefix: string,
  token?: ?string,
  name?: ?string,
  familyname?: ?string,
  fiscalnumber?: ?string,
  spidcode?: ?string,
  'spid-idp'?: ?string,
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
    let { name , familyname, fiscalnumber, spidcode } = action.profile
    return {
      ...state,
      name,
      familyname,
      fiscalnumber,
      spidcode,
      'spid-idp': action.profile['spid-idp'],
    }
  }

  return state
}

module.exports = user
