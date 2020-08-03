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
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";

export type LogoutOption = {
  keepUserData: boolean;
};

export type LogoutError = {
  error: Error;
  options: LogoutOption;
};

export type CheckSessionResult = {
  isSessionValid: boolean;
};

export const idpSelected = createStandardAction("IDP_SELECTED")<
  IdentityProvider
>();

export const testLoginRequest = createStandardAction("TEST_LOGIN_REQUEST")<
  PasswordLogin
>();

//
// Action about IDP Login phase
//

export const idpLoginUrlChanged = createStandardAction(
  "AUTHENTICATION_WEBVIEW_URL_CHANGED"
)<{ url: string }>();

export const loginSuccess = createStandardAction("LOGIN_SUCCESS")<
  SessionToken
>();

export const loginFailure = createStandardAction("LOGIN_FAILURE")<Error>();

export const logoutRequest = createStandardAction("LOGOUT_REQUEST")<
  LogoutOption
>();

export const logoutSuccess = createStandardAction("LOGOUT_SUCCESS")<
  LogoutOption
>();

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
  | ActionType<typeof resetAuthenticationState>;
