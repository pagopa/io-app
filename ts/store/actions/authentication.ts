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
  LOGOUT_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  SESSION_EXPIRED,
  SESSION_INVALID,
  SESSION_LOAD_FAILURE,
  SESSION_LOAD_REQUEST,
  SESSION_LOAD_SUCCESS,
  START_AUTHENTICATION,
  WALLET_TOKEN_LOAD_SUCCESS
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

export type LogoutRequest = Readonly<{
  type: typeof LOGOUT_REQUEST;
}>;

export type LogoutSuccess = Readonly<{
  type: typeof LOGOUT_SUCCESS;
}>;

export type LogoutFailure = Readonly<{
  type: typeof LOGOUT_FAILURE;
  payload: Error;
  error: true;
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

export type SessionInvalid = Readonly<{
  type: typeof SESSION_INVALID;
}>;

export type WalletTokenLoadSuccess = Readonly<{
  type: typeof WALLET_TOKEN_LOAD_SUCCESS;
}>;

export type AuthenticationActions =
  | StartAuthentication
  | IdpSelected
  | LoginSuccess
  | LoginFailure
  | LogoutRequest
  | LogoutSuccess
  | LogoutFailure
  | AuthenticationCompleted
  | SessionLoadRequest
  | SessionLoadSuccess
  | SessionLoadFailure
  | SessionExpired
  | SessionInvalid
  | WalletTokenLoadSuccess;

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

export const logoutRequest = (): LogoutRequest => ({
  type: LOGOUT_REQUEST
});

export const logoutSuccess = (): LogoutSuccess => ({
  type: LOGOUT_SUCCESS
});

export const logoutFailure = (error: Error): LogoutFailure => ({
  type: LOGOUT_FAILURE,
  payload: error,
  error: true
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

export const sessionInvalid = (): SessionInvalid => ({
  type: SESSION_INVALID
});

export const walletTokenLoadSuccess = (): WalletTokenLoadSuccess => ({
  type: WALLET_TOKEN_LOAD_SUCCESS
});
