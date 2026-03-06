import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../definitions/backend/identity/ReminderStatus";
import {
  enqueueMixpanelEvent,
  isMixpanelInstanceInitialized,
  mixpanelTrack
} from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export type NotificationModalFlow =
  | "authentication"
  | "send_notification_opening"
  | "access";
export type SendOpeningSource = "aar" | "message" | "not_set";
export type SendUserType = "recipient" | "mandatory" | "not_set";

export const trackNotificationInstallationTokenNotChanged = () =>
  void mixpanelTrack(
    "NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED",
    buildEventProperties("TECH", undefined)
  );

export const trackNotificationsOptInPreviewStatus = (
  contentType: PushNotificationsContentTypeEnum
) =>
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_PREVIEW_STATUS",
    buildEventProperties("UX", "action", {
      enabled: contentType === PushNotificationsContentTypeEnum.FULL
    })
  );

export const trackNotificationsOptInReminderStatus = (
  reminderStatus: ReminderStatusEnum
) =>
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_REMINDER_STATUS",
    buildEventProperties("UX", "action", {
      enabled: reminderStatus === ReminderStatusEnum.ENABLED
    })
  );

export const trackNotificationsOptInReminderOnPermissionsOff = () =>
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_REMINDER_ON_PERMISSIONS_OFF",
    buildEventProperties("UX", "control")
  );

export const trackNotificationsOptInOpenSettings = () =>
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_OPEN_SETTINGS",
    buildEventProperties("UX", "action")
  );

export const trackNotificationsOptInSkipSystemPermissions = () =>
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_SKIP_SYSTEM_PERMISSIONS",
    buildEventProperties("UX", "action")
  );

export const trackNewPushNotificationsTokenGenerated = (
  id: string,
  userOptedIn: boolean
) => {
  const eventName = "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE";
  const props = buildEventProperties("TECH", undefined);
  if (isMixpanelInstanceInitialized()) {
    mixpanelTrack(eventName, props);
  } else if (userOptedIn) {
    enqueueMixpanelEvent(eventName, id, props);
  }
};

export const trackPushNotificationTokenUploadSucceeded = () =>
  void mixpanelTrack(
    "NOTIFICATIONS_INSTALLATION_TOKEN_REGISTERED",
    buildEventProperties("TECH", undefined)
  );

export const trackPushNotificationTokenUploadFailure = (reason: string) =>
  void mixpanelTrack(
    "NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE",
    buildEventProperties("KO", "error", { reason })
  );

export const trackSystemNotificationPermissionScreenShown = (
  flow: NotificationModalFlow,
  sendOpeningSource: SendOpeningSource = "not_set",
  sendUser: SendUserType = "not_set"
) => {
  const eventName = "PUSH_NOTIF_APP_MODAL";
  const props = buildEventProperties("UX", "screen_view", {
    flow,
    opening_source: sendOpeningSource,
    send_user: sendUser
  });
  void mixpanelTrack(eventName, props);
};

export const trackSystemNotificationPermissionScreenOutcome = (
  outcome: "activate" | "dismiss",
  flow: NotificationModalFlow,
  sendOpeningSource: SendOpeningSource = "not_set",
  sendUser: SendUserType = "not_set"
) => {
  const eventName = "PUSH_NOTIF_APP_MODAL_INTERACTION";
  const props = buildEventProperties("UX", "action", {
    flow,
    outcome,
    opening_source: sendOpeningSource,
    send_user: sendUser
  });
  void mixpanelTrack(eventName, props);
};

export const trackNotificationPermissionsStatus = (
  systemNotificationPermissionsEnabled: boolean
) => {
  const eventName = "PUSH_NOTIF_STATE_UPDATED";
  const props = buildEventProperties("TECH", undefined, {
    new_notification_status: systemNotificationPermissionsEnabled
  });
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationsBannerVisualized = (route: string) => {
  const eventName = "BANNER";
  const props = buildEventProperties("UX", "screen_view", {
    banner_id: "push_notif_activation",
    banner_page: route,
    banner_landing: "os_notification_settings"
  });
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationsBannerTap = (route: string) => {
  const eventName = "TAP_BANNER";
  const props = buildEventProperties("UX", "action", {
    banner_id: "push_notif_activation",
    banner_page: route,
    banner_landing: "os_notification_settings"
  });
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationsBannerClosure = (route: string) => {
  const eventName = "CLOSE_BANNER";
  const props = buildEventProperties("UX", "action", {
    banner_id: "push_notif_activation",
    banner_page: route,
    banner_landing: "os_notification_settings"
  });
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationSystemPopupShown = () => {
  const eventName = "PUSH_NOTIF_SYSTEM_ALERT";
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationBannerDismissAlert = () => {
  const eventName = "PUSH_NOTIF_THIRD_DISMISS_ALERT";
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationBannerDismissOutcome = (
  outcome: "deactivate" | "remind_later"
) => {
  const eventName = "PUSH_NOTIF_THIRD_DISMISS_ALERT_INTERACTION";
  const props = buildEventProperties("UX", "action", { outcome });
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationBannerForceShow = () => {
  const eventName = "PUSH_NOTIF_BANNER_FORCE_SHOW";
  const props = buildEventProperties("TECH", undefined);
  void mixpanelTrack(eventName, props);
};

export const trackPushNotificationBannerStillHidden = (
  unreadMessagesCount: number
) => {
  const eventName = "PUSH_NOTIF_BANNER_STILL_HIDDEN";
  const props = buildEventProperties("TECH", undefined, {
    unread_count: unreadMessagesCount
  });
  void mixpanelTrack(eventName, props);
};
