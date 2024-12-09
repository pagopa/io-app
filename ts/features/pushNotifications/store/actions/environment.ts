import { ActionType, createStandardAction } from "typesafe-actions";

export const updateSystemNotificationsEnabled = createStandardAction(
  "UPDATE_SYSTEM_NOTIFICATIONS_ENABLED"
)<boolean>();
export const setPushPermissionsRequestDuration = createStandardAction(
  "SET_PUSH_PERMISSIONS_REQUEST_DURATION"
)<number>();

export type NotificationPermissionsActions =
  | ActionType<typeof updateSystemNotificationsEnabled>
  | ActionType<typeof setPushPermissionsRequestDuration>;
