/**
 * A reducer for the Session.
 */

import { Action } from "../../actions/types";
import { IdentityProvider } from "../../api";
import { GlobalState } from "../../reducers/types";
import { IDP_SELECTED, LOGIN_SUCCESS } from "../actions/constants";

export type UnauthenticatedWithoutIdpSessionState = {
  isAuthenticated: false;
};

export type UnauthenticatedWithIdpSessionState = {
  isAuthenticated: false;
  idp: IdentityProvider;
};

export type UnauthenticatedSessionState =
  | UnauthenticatedWithoutIdpSessionState
  | UnauthenticatedWithIdpSessionState;

export type AuthenticatedSessionState = {
  isAuthenticated: true;
  idp: IdentityProvider;
  token: string;
  expiredAt?: number;
};

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

// Selectors
export const isAuthenticatedSelector = (state: GlobalState): boolean =>
  state.session.isAuthenticated;

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
    return {
      isAuthenticated: true,
      idp: state.idp,
      token: action.payload
    };
  }

  return state;
};

export default reducer;
