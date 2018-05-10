/**
 * Action types and action creator related to the Notifications.
 */

import { NOTIFICATIONS_TOKEN_UPDATE } from "./constants";

export type NotificationsTokenUpdate = Readonly<{
  type: typeof NOTIFICATIONS_TOKEN_UPDATE;
  /**
   * The push notification service token
   */
  payload: string;
}>;

// Creators
export const updateNotificationsToken = (
  token: string
): NotificationsTokenUpdate => ({
  type: NOTIFICATIONS_TOKEN_UPDATE,
  payload: token
});

export type NotificationsActions = NotificationsTokenUpdate;
