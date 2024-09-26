import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../definitions/backend/ReminderStatus";
import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export const trackNotificationInstallationTokenNotChanged = () => {
  void mixpanelTrack("NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED");
};

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

export const trackNewPushNotificationsTokenGenerated = () => {
  void mixpanelTrack(
    "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE",
    buildEventProperties("TECH", undefined)
  );
};

export const trackPushNotificationTokenUploadSucceeded = () => {
  void mixpanelTrack(
    "NOTIFICATIONS_INSTALLATION_TOKEN_REGISTERED",
    buildEventProperties("TECH", undefined)
  );
};

export const trackPushNotificationTokenUploadFailure = (reason: string) => {
  void mixpanelTrack(
    "NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE",
    buildEventProperties("KO", "error", { reason })
  );
};
