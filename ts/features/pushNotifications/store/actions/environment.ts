import { ActionType, createStandardAction } from "typesafe-actions";

export const updateSystemNotificationsEnabled = createStandardAction(
  "UPDATE_SYSTEM_NOTIFICATIONS_ENABLED"
)<boolean>();
export const setPushPermissionsRequestDuration = createStandardAction(
  "SET_PUSH_PERMISSIONS_REQUEST_DURATION"
)<number>();
export const setEngagementScreenShown = createStandardAction(
  "SET_ENGAGEMENT_SCREEN_SHOWN"
)<void>();

export type NotificationPermissionsActions =
  | ActionType<typeof updateSystemNotificationsEnabled>
  | ActionType<typeof setPushPermissionsRequestDuration>
  | ActionType<typeof setEngagementScreenShown>;
