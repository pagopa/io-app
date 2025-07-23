import { ActionType, createStandardAction } from "typesafe-actions";

export const setActiveSessionLogin = createStandardAction(
  "SET_ACTIVE_SESSION_LOGIN"
)();

export const setFinishedActiveSessionLogin = createStandardAction(
  "SET_FINISHED_ACTIVE_SESSION_LOGIN"
)();

export const activeSessionLoginFailure = createStandardAction(
  "ACTIVE_SESSION_LOGIN_FAILURE"
)();

export type LoginInfoActions =
  | ActionType<typeof setActiveSessionLogin>
  | ActionType<typeof activeSessionLoginFailure>
  | ActionType<typeof setFinishedActiveSessionLogin>;
