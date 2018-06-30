/**
 * Action types and action creator related to the Notifications.
 */

import {
  NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE,
  NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE,
  START_NOTIFICATION_INSTALLATION_UPDATE
} from "./constants";

export type NotificationsTokenUpdate = Readonly<{
  type: typeof NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE;
  /**
   * The push notification service token
   */
  payload: string;
}>;

export type StartNotificationInstallationUpdate = Readonly<{
  type: typeof START_NOTIFICATION_INSTALLATION_UPDATE;
}>;

export type NotificationInstallationUpdateFailure = Readonly<{
  type: typeof NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE;
}>;

// Creators
export const updateNotificationsInstallationToken = (
  token: string
): NotificationsTokenUpdate => ({
  type: NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE,
  payload: token
});

export const startNotificationInstallationUpdate = (): StartNotificationInstallationUpdate => ({
  type: START_NOTIFICATION_INSTALLATION_UPDATE
});

export const updateNotificationInstallationFailure = (): NotificationInstallationUpdateFailure => ({
  type: NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE
});

export type NotificationsActions =
  | NotificationsTokenUpdate
  | StartNotificationInstallationUpdate
  | NotificationInstallationUpdateFailure;
