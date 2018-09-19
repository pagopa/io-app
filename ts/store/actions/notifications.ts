/**
 * Action types and action creator related to the Notifications.
 */

import {
  NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE,
  NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE,
  NOTIFICATIONS_PENDING_MESSAGE_CLEAR,
  NOTIFICATIONS_PENDING_MESSAGE_UPDATE
} from "./constants";

type NotificationsTokenUpdate = Readonly<{
  type: typeof NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE;
  /**
   * The push notification service token
   */
  payload: string;
}>;

type NotificationInstallationUpdateFailure = Readonly<{
  type: typeof NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE;
}>;

export type NotificationPendingMessageUpdate = Readonly<{
  type: typeof NOTIFICATIONS_PENDING_MESSAGE_UPDATE;
  payload: {
    // The message id
    id: string;
    // If the notification message was received in foreground
    foreground: boolean;
  };
}>;

export type NotificationPendingMessageClear = Readonly<{
  type: typeof NOTIFICATIONS_PENDING_MESSAGE_CLEAR;
}>;

// Creators
export const updateNotificationsInstallationToken = (
  token: string
): NotificationsTokenUpdate => ({
  type: NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE,
  payload: token
});

export const updateNotificationInstallationFailure = (): NotificationInstallationUpdateFailure => ({
  type: NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE
});

/**
 * @param id The message id
 */
export const updateNotificationsPendingMessage = (
  id: string,
  foreground: boolean
): NotificationPendingMessageUpdate => ({
  type: NOTIFICATIONS_PENDING_MESSAGE_UPDATE,
  payload: {
    id,
    foreground
  }
});
export const clearNotificationPendingMessage = (): NotificationPendingMessageClear => ({
  type: NOTIFICATIONS_PENDING_MESSAGE_CLEAR
});

export type NotificationsActions =
  | NotificationsTokenUpdate
  | NotificationInstallationUpdateFailure
  | NotificationPendingMessageUpdate
  | NotificationPendingMessageClear;
