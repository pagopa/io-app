/**
 * Action types and action creator related to the Authentication.
 */

import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { PasswordLogin } from "../../../definitions/backend/PasswordLogin";
import { PublicSession } from "../../../definitions/backend/PublicSession";
import { SessionToken } from "../../types/SessionToken";
import { SupportToken } from "../../../definitions/backend/SupportToken";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { IdpData } from "../../../definitions/content/IdpData";

export type LogoutError = {
  error: Error;
};

export type CheckSessionResult = {
  isSessionValid: boolean;
};

export const idpSelected = createStandardAction("IDP_SELECTED")<SpidIdp>();

export const testLoginRequest =
  createStandardAction("TEST_LOGIN_REQUEST")<PasswordLogin>();

//
// Action about IDP Login phase
//

export const idpLoginUrlChanged = createStandardAction(
  "AUTHENTICATION_WEBVIEW_URL_CHANGED"
)<{ url: string }>();

export const loginSuccess = createStandardAction("LOGIN_SUCCESS")<{
  token: SessionToken;
  idp: keyof IdpData;
}>();

export const loginFailure = createStandardAction("LOGIN_FAILURE")<{
  error: Error;
  idp: keyof IdpData | undefined;
}>();

export const logoutRequest = createStandardAction("LOGOUT_REQUEST")();

export const logoutSuccess = createStandardAction("LOGOUT_SUCCESS")();

export const logoutFailure = createAction(
  "LOGOUT_FAILURE",
  resolve => (logoutError: LogoutError) => resolve(logoutError, true)
);

export const sessionInformationLoadSuccess = createStandardAction(
  "SESSION_INFO_LOAD_SUCCESS"
)<PublicSession>();

export const sessionInformationLoadFailure = createAction(
  "SESSION_INFO_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, true)
);

export const resetAuthenticationState = createStandardAction(
  "RESET_AUTHENTICATION_STATE"
)();

export const checkCurrentSession = createAsyncAction(
  "CHECK_CURRENT_SESSION_REQUEST",
  "CHECK_CURRENT_SESSION_SUCCESS",
  "CHECK_CURRENT_SESSION_FAILURE"
)<void, CheckSessionResult, Error>();

export const loadSupportToken = createAsyncAction(
  "LOAD_TOKEN_SUPPORT_REQUEST",
  "LOAD_TOKEN_SUPPORT_SUCCESS",
  "LOAD_TOKEN_SUPPORT_FAILURE"
)<void, SupportToken, Error>();

export const sessionExpired = createStandardAction("SESSION_EXPIRED")();

export const sessionInvalid = createStandardAction("SESSION_INVALID")();

export type AuthenticationActions =
  | ActionType<typeof idpSelected>
  | ActionType<typeof idpLoginUrlChanged>
  | ActionType<typeof testLoginRequest>
  | ActionType<typeof loginSuccess>
  | ActionType<typeof loginFailure>
  | ActionType<typeof logoutRequest>
  | ActionType<typeof logoutSuccess>
  | ActionType<typeof logoutFailure>
  | ActionType<typeof sessionInformationLoadSuccess>
  | ActionType<typeof sessionInformationLoadFailure>
  | ActionType<typeof checkCurrentSession>
  | ActionType<typeof sessionExpired>
  | ActionType<typeof sessionInvalid>
  | ActionType<typeof resetAuthenticationState>
  | ActionType<typeof loadSupportToken>;
