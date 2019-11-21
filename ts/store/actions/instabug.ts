/**
 * Action types and action creator related to InstabugInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const instabugUnreadMessagesLoaded = createStandardAction(
  "INSTABUG_UNREAD_MESSAGES_LOADED"
)<number>();

export const updateInstabugUnreadMessages = createStandardAction(
  "UPDATE_INSTABUG_UNREAD_MESSAGES"
)();

export const instabugUnreadMessagesNotificationLoaded = createStandardAction(
  "INSTABUG_UNREAD_MESSAGES_NOTIFICATION_LOADED"
)<number>();

export const updateInstabugUnreadNotification = createStandardAction(
  "UPDATE_INSTABUG_UNREAD_NOTIFICATION"
)<{
  unreadMessagesNotification: number;
}>();

export type InstabugInfoActions =
  | ActionType<typeof instabugUnreadMessagesLoaded>
  | ActionType<typeof updateInstabugUnreadMessages>
  | ActionType<typeof instabugUnreadMessagesNotificationLoaded>
  | ActionType<typeof updateInstabugUnreadNotification>;
