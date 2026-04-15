import { ActionType, createStandardAction } from "typesafe-actions";
import { PendingMessageState } from "../reducers/pendingMessage";

export const updateNotificationsPendingMessage = createStandardAction(
  "NOTIFICATIONS_PENDING_MESSAGE_UPDATE"
)<PendingMessageState>();

export const clearNotificationPendingMessage = createStandardAction(
  "NOTIFICATIONS_PENDING_MESSAGE_CLEAR"
)<void>();

export type PendingMessageActions =
  | ActionType<typeof updateNotificationsPendingMessage>
  | ActionType<typeof clearNotificationPendingMessage>;
