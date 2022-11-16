/**
 * Action types and action creator related to the Notifications.
 */

import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

export const updateNotificationsInstallationToken = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE"
)<string>();

// the notification token is registered in the backend
export const notificationsInstallationTokenRegistered = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_TOKEN_REGISTERED"
)<string>();

export const updateNotificationInstallationFailure = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE"
)<Error>();

export const updateNotificationsPendingMessage = createAction(
  "NOTIFICATIONS_PENDING_MESSAGE_UPDATE",
  resolve => (messageId: string, foreground: boolean) =>
    resolve({ id: messageId, foreground })
);

export const clearNotificationPendingMessage = createStandardAction(
  "NOTIFICATIONS_PENDING_MESSAGE_CLEAR"
)();

export const notificationsInfoScreenConsent = createStandardAction(
  "NOTIFICATIONS_INFO_SCREEN_CONSENT"
)<undefined>();

export type NotificationsActions =
  | ActionType<typeof updateNotificationsInstallationToken>
  | ActionType<typeof updateNotificationInstallationFailure>
  | ActionType<typeof updateNotificationsPendingMessage>
  | ActionType<typeof clearNotificationPendingMessage>
  | ActionType<typeof notificationsInstallationTokenRegistered>
  | ActionType<typeof notificationsInfoScreenConsent>;
