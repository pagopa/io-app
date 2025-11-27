import { ActionType, createStandardAction } from "typesafe-actions";
import { SpidIdp } from "../../../../../utils/idps";
import { SessionToken } from "../../../../../types/SessionToken";
import { SpidLevel } from "../../../login/cie/utils";

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

export const setCieIDSelectedSecurityLevelActiveSessionLogin =
  createStandardAction(
    "SET_CIE_ID_SELECTED_SECURITY_LEVEL_ACTIVE_SESSION_LOGIN"
  )<SpidLevel>();

export const closeSessionExpirationBanner = createStandardAction(
  "CLOSE_SESSION_EXPIRATION_BANNER"
)();

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
  | ActionType<typeof setCieIDSelectedSecurityLevelActiveSessionLogin>
  | ActionType<typeof closeSessionExpirationBanner>;
