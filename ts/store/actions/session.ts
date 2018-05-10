/**
 * Action types and action creator related to the Session.
 */

import { IdentityProvider } from "../../api/types";
import { SessionState } from "../reducers/session";
import {
  IDP_SELECTED,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  SESSION_INITIALIZE_SUCCESS
} from "./constants";

// Actions
export type IdpSelected = Readonly<{
  type: typeof IDP_SELECTED;
  payload: IdentityProvider;
}>;

export type LoginSuccess = Readonly<{
  type: typeof LOGIN_SUCCESS;
  payload: string;
}>;

export type LoginFailure = Readonly<{
  type: typeof LOGIN_FAILURE;
}>;

export type SessionInitializeSuccess = Readonly<{
  type: typeof SESSION_INITIALIZE_SUCCESS;
  /** The session token */
  payload: string;
}>;

export type SessionActions =
  | IdpSelected
  | LoginSuccess
  | LoginFailure
  | SessionInitializeSuccess;

// Creators
export const selectIdp = (idp: IdentityProvider): IdpSelected => ({
  type: IDP_SELECTED,
  payload: idp
});

export const loginSuccess = (token: string): LoginSuccess => ({
  type: LOGIN_SUCCESS,
  payload: token
});

export const loginFailure = (): LoginFailure => ({
  type: LOGIN_FAILURE
});

export const sessionInitializeSuccess = (token: string) => ({
  type: SESSION_INITIALIZE_SUCCESS,
  payload: token
});
