import { ActionType, createStandardAction } from "typesafe-actions";

export const notificationsInfoScreenConsent = createStandardAction(
  "NOTIFICATIONS_INFO_SCREEN_CONSENT"
)<void>();

export type ProfileNotificationPermissionsActions = ActionType<
  typeof notificationsInfoScreenConsent
>;
