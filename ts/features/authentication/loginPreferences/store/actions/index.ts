import { ActionType, createStandardAction } from "typesafe-actions";

export const closeSessionExpirationBanner = createStandardAction(
  "CLOSE_SESSION_EXPIRATION_BANNER"
)();

export const setActiveSessionLoginLocalFlag = createStandardAction(
  "SET_ACTIVE_SESSION_LOGIN_LOCAL_FLAG"
)<boolean>();

export type LoginPreferencesActions = ActionType<
  typeof closeSessionExpirationBanner | typeof setActiveSessionLoginLocalFlag
>;
