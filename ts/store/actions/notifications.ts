import { NOTIFICATIONS_TOKEN_UPDATE } from "./constants";

export type NotificationsTokenUpdate = Readonly<{
  type: typeof NOTIFICATIONS_TOKEN_UPDATE;
  /**
   * The push notification service token
   */
  payload: string;
}>;

export type NotificationsActions = NotificationsTokenUpdate
