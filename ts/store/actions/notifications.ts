/**
 * Action types and action creator related to the Notifications.
 */

import {
  NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE,
  NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE
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

export type NotificationsActions =
  | NotificationsTokenUpdate
  | NotificationInstallationUpdateFailure;
