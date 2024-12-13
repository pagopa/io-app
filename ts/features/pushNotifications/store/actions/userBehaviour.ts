import { ActionType, createStandardAction } from "typesafe-actions";

export const setUserDismissedNotificationsBanner = createStandardAction(
  "SET_USER_DISMISSED_NOTIFICATIONS_BANNER"
)<void>();
export const setPushNotificationBannerForceDismissed = createStandardAction(
  "SET_PUSH_NOTIFICATION_BANNER_FORCE_DISMISSED"
)<void>();
export const resetNotificationBannerDismissState = createStandardAction(
  "RESET_NOTIFICATION_BANNER_DISMISS_STATE"
)<void>();

export type UserBehaviourActions =
  | ActionType<typeof setUserDismissedNotificationsBanner>
  | ActionType<typeof resetNotificationBannerDismissState>
  | ActionType<typeof setPushNotificationBannerForceDismissed>;
