import { ActionType, createStandardAction } from "typesafe-actions";

export const closeSessionExpirationBanner = createStandardAction(
  "CLOSE_SESSION_EXPIRATION_BANNER"
)();

export type LoginPreferencesActions = ActionType<
  typeof closeSessionExpirationBanner
>;
