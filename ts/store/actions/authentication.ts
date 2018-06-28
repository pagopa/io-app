/**
 * Action types and action creator related to the Authentication.
 */

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";
import {
  AUTHENTICATION_COMPLETED,
  IDP_SELECTED,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGOUT,
  SESSION_EXPIRED,
  SESSION_LOAD_FAILURE,
  SESSION_LOAD_REQUEST,
  SESSION_LOAD_SUCCESS,
  START_AUTHENTICATION
} from "./constants";

// Actions

export type StartAuthentication = Readonly<{
  type: typeof START_AUTHENTICATION;
}>;

export type IdpSelected = Readonly<{
  type: typeof IDP_SELECTED;
  payload: IdentityProvider;
}>;

export type LoginSuccess = Readonly<{
  type: typeof LOGIN_SUCCESS;
  payload: SessionToken;
}>;

export type LoginFailure = Readonly<{
  type: typeof LOGIN_FAILURE;
}>;

export type Logout = Readonly<{
  type: typeof LOGOUT;
}>;

export type AuthenticationCompleted = Readonly<{
  type: typeof AUTHENTICATION_COMPLETED;
}>;

export type SessionLoadRequest = Readonly<{
  type: typeof SESSION_LOAD_REQUEST;
}>;

export type SessionLoadSuccess = Readonly<{
  type: typeof SESSION_LOAD_SUCCESS;
  payload: PublicSession;
}>;

export type SessionLoadFailure = Readonly<{
  type: typeof SESSION_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type SessionExpired = Readonly<{
  type: typeof SESSION_EXPIRED;
}>;

export type AuthenticationActions =
  | StartAuthentication
  | IdpSelected
  | LoginSuccess
  | LoginFailure
  | Logout
  | AuthenticationCompleted
  | SessionLoadRequest
  | SessionLoadSuccess
  | SessionLoadFailure
  | SessionExpired;

// Creators

export const startAuthentication = (): StartAuthentication => ({
  type: START_AUTHENTICATION
});

export const idpSelected = (idp: IdentityProvider): IdpSelected => ({
  type: IDP_SELECTED,
  payload: idp
});

export const loginSuccess = (token: SessionToken): LoginSuccess => ({
  type: LOGIN_SUCCESS,
  payload: token
});

export const loginFailure = (): LoginFailure => ({
  type: LOGIN_FAILURE
});

export const logout = (): Logout => ({
  type: LOGOUT
});

export const authenticationCompleted = (): AuthenticationCompleted => ({
  type: AUTHENTICATION_COMPLETED
});

export const sessionLoadRequest = (): SessionLoadRequest => ({
  type: SESSION_LOAD_REQUEST
});

export const sessionLoadSuccess = (
  publicSession: PublicSession
): SessionLoadSuccess => ({
  type: SESSION_LOAD_SUCCESS,
  payload: publicSession
});

export const sessionLoadFailure = (error: Error): SessionLoadFailure => ({
  type: SESSION_LOAD_FAILURE,
  payload: error,
  error: true
});

export const sessionExpired = (): SessionExpired => ({
  type: SESSION_EXPIRED
});
