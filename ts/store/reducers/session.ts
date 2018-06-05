/**
 * A reducer for the Session.
 */

import { IdentityProvider } from "../../models/IdentityProvider";
import { GlobalState } from "../../reducers/types";
import { SessionToken } from "../../types/SessionToken";
import { IDP_SELECTED, LOGIN_SUCCESS } from "../actions/constants";
import { Action } from "../actions/types";

export type UnauthenticatedWithoutIdpSessionState = Readonly<{
  isAuthenticated: false;
}>;

export type UnauthenticatedWithIdpSessionState = Readonly<{
  isAuthenticated: false;
  idp: IdentityProvider;
}>;

export type UnauthenticatedSessionState =
  | UnauthenticatedWithoutIdpSessionState
  | UnauthenticatedWithIdpSessionState;

export type AuthenticatedSessionState = Readonly<{
  isAuthenticated: true;
  idp: IdentityProvider;
  token: SessionToken;
  expiredAt?: number;
}>;

export type SessionState =
  | UnauthenticatedSessionState
  | AuthenticatedSessionState;

export const INITIAL_STATE: UnauthenticatedWithoutIdpSessionState = {
  isAuthenticated: false
};

// Type guards
export function isUnauthenticatedWithIdpSessionState(
  state: any
): state is UnauthenticatedWithIdpSessionState {
  return !state.isAuthenticated && state.idp;
}

export function isUnauthenticatedWithoutIdpSessionState(
  state: any
): state is UnauthenticatedWithoutIdpSessionState {
  return !state.isAuthenticated && !state.idp;
}

export function isAuthenticated(
  state: SessionState
): state is AuthenticatedSessionState {
  return state.isAuthenticated;
}

// Selectors
export const isAuthenticatedSelector = (state: GlobalState): boolean =>
  state.session.isAuthenticated;

export const sessionTokenSelector = (
  state: GlobalState
): SessionToken | undefined => {
  return isAuthenticated(state.session) ? state.session.token : undefined;
};

const reducer = (
  state: SessionState = INITIAL_STATE,
  action: Action
): SessionState => {
  if (action.type === IDP_SELECTED && !state.isAuthenticated) {
    return { ...state, idp: action.payload };
  }

  if (
    action.type === LOGIN_SUCCESS &&
    isUnauthenticatedWithIdpSessionState(state)
  ) {
    return { isAuthenticated: true, idp: state.idp, token: action.payload };
  }

  return state;
};

export default reducer;
