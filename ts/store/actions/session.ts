/**
 * Action types and action creator related to the Session.
 *
 * @flow
 */

import { IdentityProvider } from "../../api";
import { IDP_SELECTED, LOGIN_FAILURE, LOGIN_SUCCESS } from "./constants";

// Actions
export type IdpSelected = {
  type: typeof IDP_SELECTED;
  payload: IdentityProvider;
};

export type LoginSuccess = {
  type: typeof LOGIN_SUCCESS;
  payload: string;
};

export type LoginFailure = {
  type: typeof LOGIN_FAILURE;
};

export type SessionActions = IdpSelected | LoginSuccess | LoginFailure;

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
