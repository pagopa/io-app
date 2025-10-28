import { ActionType, createStandardAction } from "typesafe-actions";
import { SpidIdp } from "../../../../../utils/idps";
import { SessionToken } from "../../../../../types/SessionToken";

export const setActiveSessionLoginLocalFlag = createStandardAction(
  "SET_ACTIVE_SESSION_LOGIN_LOCAL_FLAG"
)<boolean>();

export const setStartActiveSessionLogin = createStandardAction(
  "SET_START_ACTIVE_SESSION_LOGIN"
)();

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
}>();

export const setFinishedActiveSessionLoginFlow = createStandardAction(
  "SET_FINISHED_ACTIVE_SESSION_LOGIN_FLOW"
)();

export const setLoggedOutUserWithDifferentCF = createStandardAction(
  "SET_LOGGED_OUT_USER_WITH_DIFFERENT_CF"
)();

export type LoginInfoActions =
  | ActionType<typeof setActiveSessionLoginLocalFlag>
  | ActionType<typeof setStartActiveSessionLogin>
  | ActionType<typeof setRetryActiveSessionLogin>
  | ActionType<typeof setIdpSelectedActiveSessionLogin>
  | ActionType<typeof activeSessionLoginFailure>
  | ActionType<typeof activeSessionLoginSuccess>
  | ActionType<typeof consolidateActiveSessionLoginData>
  | ActionType<typeof setFastLoginOptSessionLogin>
  | ActionType<typeof setFinishedActiveSessionLoginFlow>
  | ActionType<typeof setLoggedOutUserWithDifferentCF>;
