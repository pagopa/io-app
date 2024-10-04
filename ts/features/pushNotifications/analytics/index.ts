import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../definitions/backend/ReminderStatus";
import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

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

export const trackNewPushNotificationsTokenGenerated = () =>
  void mixpanelTrack(
    "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE",
    buildEventProperties("TECH", undefined)
  );

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

export const trackSystemNotificationPermissionScreenShown = () => {
  const eventName = "PUSH_NOTIF_APP_MODAL";
  const props = buildEventProperties("UX", "screen_view");
  void mixpanelTrack(eventName, props);
};

export const trackSystemNotificationPermissionScreenOutcome = (
  outcome: "activate" | "dismiss"
) => {
  const eventName = "PUSH_NOTIF_APP_MODAL_INTERACTION";
  const props = buildEventProperties("UX", "action", {
    outcome
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
