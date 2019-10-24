/**
 * Action types and action creator related to InstabugInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const instabugUnreadMessagesLoaded = createStandardAction(
  "INSTABUG_UNREAD_MESSAGES_LOADED"
)<number>();

export const updateInstabugUnreadMessagesLoaded = createStandardAction(
  "UPDATE_INSTABUG_UNREAD_MESSAGES_LOADED"
)<number>();

export type InstabugInfoActions =
  | ActionType<typeof instabugUnreadMessagesLoaded>
  | ActionType<typeof updateInstabugUnreadMessagesLoaded>;
