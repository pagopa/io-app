/**
 * Action types and action creator related to the Authentication.
 */

import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { IdpData } from "../../../../../../definitions/content/IdpData";
import { PasswordLogin } from "../../../../../../definitions/session_manager/PasswordLogin";
import { PublicSession } from "../../../../../../definitions/session_manager/PublicSession";
import { SpidIdp } from "../../../../../utils/idps";

export type CheckSessionResult = {
  isSessionValid: boolean;
};

export type LogoutError = {
  error: Error;
};

export const idpSelected = createStandardAction("IDP_SELECTED")<SpidIdp>();

export const testLoginRequest =
  createStandardAction("TEST_LOGIN_REQUEST")<PasswordLogin>();

export const testLoginCleanUp = createStandardAction("TEST_LOGIN_CLEAN_UP")();

//
// Action about IDP Login phase
//

export const idpLoginUrlChanged = createStandardAction(
  "AUTHENTICATION_WEBVIEW_URL_CHANGED"
)<{ url: string }>();

export const loginSuccess = createStandardAction("LOGIN_SUCCESS")<{
  idp: keyof IdpData;
  token: string;
}>();

export const loginFailure = createStandardAction("LOGIN_FAILURE")<{
  error: Error;
  idp: keyof IdpData | undefined;
}>();

export const logoutRequest = createStandardAction("LOGOUT_REQUEST")<{
  withApiCall: boolean;
}>();

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

export const disableNativeAuthentication = createStandardAction(
  "DISABLE_NATIVE_AUTHENTICATION"
)();

export const checkCurrentSession = createAsyncAction(
  "CHECK_CURRENT_SESSION_REQUEST",
  "CHECK_CURRENT_SESSION_SUCCESS",
  "CHECK_CURRENT_SESSION_FAILURE"
)<void, CheckSessionResult, Error>();

export const sessionExpired = createStandardAction("SESSION_EXPIRED")();

// Login successful on the backend but not propagated to the app
export const sessionCorrupted = createStandardAction("SESSION_CORRUPTED")();

export const sessionInvalid = createStandardAction("SESSION_INVALID")();

export const clearCurrentSession = createStandardAction(
  "CLEAR_CURRENT_SESSION"
)();

export type AuthenticationActions =
  | ActionType<typeof checkCurrentSession>
  | ActionType<typeof clearCurrentSession>
  | ActionType<typeof disableNativeAuthentication>
  | ActionType<typeof idpLoginUrlChanged>
  | ActionType<typeof idpSelected>
  | ActionType<typeof loginFailure>
  | ActionType<typeof loginSuccess>
  | ActionType<typeof logoutFailure>
  | ActionType<typeof logoutRequest>
  | ActionType<typeof logoutSuccess>
  | ActionType<typeof resetAuthenticationState>
  | ActionType<typeof sessionCorrupted>
  | ActionType<typeof sessionExpired>
  | ActionType<typeof sessionInformationLoadFailure>
  | ActionType<typeof sessionInformationLoadSuccess>
  | ActionType<typeof sessionInvalid>
  | ActionType<typeof testLoginCleanUp>
  | ActionType<typeof testLoginRequest>;
