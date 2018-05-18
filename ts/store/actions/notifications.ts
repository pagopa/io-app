/**
 * Action types and action creator related to the Notifications.
 */

import { NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE } from "./constants";

export type NotificationsTokenUpdate = Readonly<{
  type: typeof NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE;
  /**
   * The push notification service token
   */
  payload: string;
}>;

// Creators
export const updateNotificationsInstallationToken = (
  token: string
): NotificationsTokenUpdate => ({
  type: NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE,
  payload: token
});

export type NotificationsActions = NotificationsTokenUpdate;
