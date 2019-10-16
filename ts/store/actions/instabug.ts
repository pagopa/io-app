/**
 * Action types and action creator related to InstabugInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const responseInstabugUnreadMessagesLoaded = createStandardAction(
  "RESPONSE_INSTABUG_INFO_LOADED"
)<number>();

export type InstabugInfoActions = ActionType<
  typeof responseInstabugUnreadMessagesLoaded
>;
