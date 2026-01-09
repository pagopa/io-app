import { ActionType, createStandardAction } from "typesafe-actions";
import { SpidIdp } from "../../../../../utils/idps";
import { SessionToken } from "../../../../../types/SessionToken";
import { SpidLevel } from "../../../login/cie/utils";
import { PasswordLogin } from "../../../../../../definitions/session_manager/PasswordLogin";

export const setActiveSessionLoginLocalFlag = createStandardAction(
  "SET_ACTIVE_SESSION_LOGIN_LOCAL_FLAG"
)<boolean>();

export const setStartActiveSessionLogin = createStandardAction(
  "SET_START_ACTIVE_SESSION_LOGIN"
)();

export const setActiveSessionLoginBlockingScreenHasBeenVisualized =
  createStandardAction("SET_VISUALIZE_ACTIVE_SESSION_LOGIN_BLOCKING_SCREEN")();

export const setRetryActiveSessionLogin = createStandardAction(
  "SET_RETRY_ACTIVE_SESSION_LOGIN"
)();

export const setIdpSelectedActiveSessionLogin = createStandardAction(
  "SET_IDP_SELECTED_ACTIVE_SESSION_LOGIN"
)<SpidIdp>();

export const activeSessionLoginFailure = createStandardAction(
  "ACTIVE_SESSION_LOGIN_FAILURE"
)();

export const activeSessionLoginSuccess = createStandardAction(
  "ACTIVE_SESSION_LOGIN_SUCCESS"
)<SessionToken>();

export const setFastLoginOptSessionLogin = createStandardAction(
  "SET_FAST_LOGIN_OPT_IN_ACTIVE_SESSION_LOGIN"
)<boolean>();

export const consolidateActiveSessionLoginData = createStandardAction(
  "CONSOLIDATE_ACTIVE_SESSION_LOGIN_DATA"
)<{
  token: SessionToken;
  idp: SpidIdp;
  fastLoginOptIn: boolean;
  cieIDSelectedSecurityLevel?: SpidLevel;
}>();

export const setFinishedActiveSessionLoginFlow = createStandardAction(
  "SET_FINISHED_ACTIVE_SESSION_LOGIN_FLOW"
)();

export const setLoggedOutUserWithDifferentCF = createStandardAction(
  "SET_LOGGED_OUT_USER_WITH_DIFFERENT_CF"
)();

/**
 * Action to trigger logout before session corruption.
 *
 * This action is dispatched when the session needs to be corrupted but we still
 * have a valid token to perform the logout API call. It initiates a logout request
 * to the backend and then proceeds to corrupt the session.
 *
 * Flow:
 * 1. Dispatch this action with valid token
 * 2. Perform logout API call to backend
 * 3. Clean up crypto keys and reset mixpanel
 * 4. Finally dispatch sessionCorrupted() to complete the flow
 *
 * This approach preserves the existing sessionCorrupted logic while ensuring
 * proper backend logout when we still have access to the session token.
 */
export const logoutBeforeSessionCorrupted = createStandardAction(
  "LOGOUT_BEFORE_SESSION_CORRUPTED"
)();

export const setFinalizeLoggedOutUserWithDifferentCF = createStandardAction(
  "SET_FINALIZE_LOGGED_OUT_USER_WITH_DIFFERENT_CF"
)();

export const setCieIDSelectedSecurityLevelActiveSessionLogin =
  createStandardAction(
    "SET_CIE_ID_SELECTED_SECURITY_LEVEL_ACTIVE_SESSION_LOGIN"
  )<SpidLevel>();

export const closeSessionExpirationBanner = createStandardAction(
  "CLOSE_SESSION_EXPIRATION_BANNER"
)();

export const testActiveSessionLoginRequest = createStandardAction(
  "TEST_ACTIVE_SESSION_LOGIN_REQUEST"
)<PasswordLogin>();

export type LoginInfoActions =
  | ActionType<typeof setActiveSessionLoginLocalFlag>
  | ActionType<typeof setActiveSessionLoginBlockingScreenHasBeenVisualized>
  | ActionType<typeof setStartActiveSessionLogin>
  | ActionType<typeof setRetryActiveSessionLogin>
  | ActionType<typeof setIdpSelectedActiveSessionLogin>
  | ActionType<typeof activeSessionLoginFailure>
  | ActionType<typeof activeSessionLoginSuccess>
  | ActionType<typeof consolidateActiveSessionLoginData>
  | ActionType<typeof setFastLoginOptSessionLogin>
  | ActionType<typeof setFinishedActiveSessionLoginFlow>
  | ActionType<typeof setLoggedOutUserWithDifferentCF>
  | ActionType<typeof logoutBeforeSessionCorrupted>
  | ActionType<typeof setFinalizeLoggedOutUserWithDifferentCF>
  | ActionType<typeof setCieIDSelectedSecurityLevelActiveSessionLogin>
  | ActionType<typeof closeSessionExpirationBanner>
  | ActionType<typeof testActiveSessionLoginRequest>;
