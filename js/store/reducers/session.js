/**
 * A reducer for the Session.
 *
 * @flow
 */

import { type IdentityProvider } from '../../api'
import { type Action } from '../../actions/types'
import { type GlobalState } from '../../reducers/types'
import { IDP_SELECTED, LOGIN_SUCCESS } from '../actions/constants'

export type UnauthenticatedWithoutIdpSessionState = {|
  isAuthenticated: false
|}

export type UnauthenticatedWithIdpSessionState = {
  isAuthenticated: false,
  idp: IdentityProvider
}

export type UnauthenticatedSessionState =
  | UnauthenticatedWithoutIdpSessionState
  | UnauthenticatedWithIdpSessionState

export type AuthenticatedSessionState = {
  isAuthenticated: true,
  idp: IdentityProvider,
  token: string,
  expiredAt?: number
}

export type SessionState =
  | UnauthenticatedSessionState
  | AuthenticatedSessionState

export const INITIAL_STATE: UnauthenticatedWithoutIdpSessionState = {
  isAuthenticated: false
}

// Selectors
export const isAuthenticatedSelector = (state: GlobalState): boolean =>
  state.session.isAuthenticated

const reducer = (
  state: SessionState = INITIAL_STATE,
  action: Action
): SessionState => {
  if (action.type === IDP_SELECTED && !state.isAuthenticated) {
    return { ...state, idp: action.payload }
  }

  if (action.type === LOGIN_SUCCESS && !state.isAuthenticated && state.idp) {
    return {
      isAuthenticated: true,
      idp: state.idp,
      token: action.payload
    }
  }

  return state
}

export default reducer
