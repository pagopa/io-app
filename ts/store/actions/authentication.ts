/**
 * Action types and action creator related to the Authentication.
 */

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";
import {
  IDP_SELECTED,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGOUT_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  SESSION_EXPIRED,
  SESSION_INFO_LOAD_FAILURE,
  SESSION_INFO_LOAD_SUCCESS,
  SESSION_INVALID
} from "./constants";

// Actions

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

export type SessionInformationLoadSuccess = Readonly<{
  type: typeof SESSION_INFO_LOAD_SUCCESS;
  payload: PublicSession;
}>;

export type SessionInformationLoadFailure = Readonly<{
  type: typeof SESSION_INFO_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type SessionExpired = Readonly<{
  type: typeof SESSION_EXPIRED;
}>;

export type SessionInvalid = Readonly<{
  type: typeof SESSION_INVALID;
}>;

export type AuthenticationActions =
  | IdpSelected
  | LoginSuccess
  | LoginFailure
  | LogoutRequest
  | LogoutSuccess
  | LogoutFailure
  | SessionInformationLoadSuccess
  | SessionInformationLoadFailure
  | SessionExpired
  | SessionInvalid;

// Creators

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

export const logoutSuccess: LogoutSuccess = {
  type: LOGOUT_SUCCESS
};

export const logoutFailure = (error: Error): LogoutFailure => ({
  type: LOGOUT_FAILURE,
  payload: error,
  error: true
});

export const sessionInformationLoadSuccess = (
  publicSession: PublicSession
): SessionInformationLoadSuccess => ({
  type: SESSION_INFO_LOAD_SUCCESS,
  payload: publicSession
});

export const sessionInformationLoadFailure = (
  error: Error
): SessionInformationLoadFailure => ({
  type: SESSION_INFO_LOAD_FAILURE,
  payload: error,
  error: true
});

export const sessionExpired: SessionExpired = {
  type: SESSION_EXPIRED
};

export const sessionInvalid: SessionInvalid = {
  type: SESSION_INVALID
};
