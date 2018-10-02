/**
 * Action types and action creator related to the Authentication.
 */

import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";

export const idpSelected = createStandardAction("IDP_SELECTED")<
  IdentityProvider
>();

export const loginSuccess = createStandardAction("LOGIN_SUCCESS")<
  SessionToken
>();

export const loginFailure = createStandardAction("LOGIN_FAILURE")();

export const logoutRequest = createStandardAction("LOGOUT_REQUEST")();

export const logoutSuccess = createStandardAction("LOGOUT_SUCCESS")();

export const logoutFailure = createAction(
  "LOGOUT_FAILURE",
  resolve => (error: Error) => resolve(error, true)
);

export const sessionInformationLoadSuccess = createStandardAction(
  "SESSION_INFO_LOAD_SUCCESS"
)<PublicSession>();

export const sessionInformationLoadFailure = createAction(
  "SESSION_INFO_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, true)
);

export const sessionExpired = createStandardAction("SESSION_EXPIRED")();

export const sessionInvalid = createStandardAction("SESSION_INVALID")();

export type AuthenticationActions =
  | ActionType<typeof idpSelected>
  | ActionType<typeof loginSuccess>
  | ActionType<typeof loginFailure>
  | ActionType<typeof logoutRequest>
  | ActionType<typeof logoutSuccess>
  | ActionType<typeof logoutFailure>
  | ActionType<typeof sessionInformationLoadSuccess>
  | ActionType<typeof sessionInformationLoadFailure>
  | ActionType<typeof sessionExpired>
  | ActionType<typeof sessionInvalid>;
