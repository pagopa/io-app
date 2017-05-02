/**
 * Implementa un reducer redux per lo stato utente.
 *
 * Intercetta le azioni di logIn() e logOut()
 *
 * @flow
 */

'use strict'

import type { Action } from '../actions/types'
import type { ApiUserProfile } from '../utils/api'

export type LoggedOutUserState = {
  isLoggedIn: false,
  apiUrlPrefix: string,
}

export type LoggedInUserState = {
  isLoggedIn: true,
  apiUrlPrefix: string,
  token: string,
  idpId: string,
  profile?: ApiUserProfile,
}

export type UserState = LoggedOutUserState | LoggedInUserState

const initialUserState: LoggedOutUserState = {
  isLoggedIn: false,
  apiUrlPrefix: 'https://spid-test.spc-app1.teamdigitale.it',
}

function user(state: UserState = initialUserState, action: Action): UserState {

  if (action.type === 'LOGGED_IN' && state.isLoggedIn === false) {
    return {
      isLoggedIn: true,
      apiUrlPrefix: state.apiUrlPrefix,
      token: action.data.token,
      idpId: action.data.idpId,
    }
  }

  if (action.type === 'LOGGED_OUT' && state.isLoggedIn === true) {
    return initialUserState
  }

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

module.exports = user
