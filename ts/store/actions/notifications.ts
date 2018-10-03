/**
 * Action types and action creator related to the Notifications.
 */

import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

export const updateNotificationsInstallationToken = createAction(
  "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE",
  resolve => (token: string) => resolve(token)
);

export const updateNotificationInstallationFailure = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE"
)();

export const updateNotificationsPendingMessage = createAction(
  "NOTIFICATIONS_PENDING_MESSAGE_UPDATE",
  resolve => (messageId: string, foreground: boolean) =>
    resolve({ id: messageId, foreground })
);

export const clearNotificationPendingMessage = createStandardAction(
  "NOTIFICATIONS_PENDING_MESSAGE_CLEAR"
)();

export type NotificationsActions =
  | ActionType<typeof updateNotificationsInstallationToken>
  | ActionType<typeof updateNotificationInstallationFailure>
  | ActionType<typeof updateNotificationsPendingMessage>
  | ActionType<typeof clearNotificationPendingMessage>;
