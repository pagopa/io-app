import { ActionType, createStandardAction } from "typesafe-actions";

export const newPushNotificationsToken = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE"
)<string>();

// the notification token is registered in the backend
export const pushNotificationsTokenUploaded = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_TOKEN_REGISTERED"
)<string>();

export type NotificationsActions =
  | ActionType<typeof newPushNotificationsToken>
  | ActionType<typeof pushNotificationsTokenUploaded>;
