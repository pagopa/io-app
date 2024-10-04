import { ActionType, createStandardAction } from "typesafe-actions";

export const updateSystemNotificationsEnabled = createStandardAction(
  "UPDATE_SYSTEM_NOTIFICATIONS_ENABLED"
)<boolean>();

export type NotificationPermissionsActions = ActionType<
  typeof updateSystemNotificationsEnabled
>;
