import { ActionType, createStandardAction } from "typesafe-actions";

export const closeSessionExpirationBanner = createStandardAction(
  "CLOSE_SESSION_EXPIRATION_BANNER"
)();

export type FastLoginSessionExpirationActions = ActionType<
  typeof closeSessionExpirationBanner
>;
