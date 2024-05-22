import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../definitions/backend/ReminderStatus";
import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export function trackNotificationInstallationTokenNotChanged() {
  void mixpanelTrack("NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED");
}

export function trackNotificationsOptInPreviewStatus(
  contentType: PushNotificationsContentTypeEnum
) {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_PREVIEW_STATUS",
    buildEventProperties("UX", "action", {
      enabled: contentType === PushNotificationsContentTypeEnum.FULL
    })
  );
}

export function trackNotificationsOptInReminderStatus(
  reminderStatus: ReminderStatusEnum
) {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_REMINDER_STATUS",
    buildEventProperties("UX", "action", {
      enabled: reminderStatus === ReminderStatusEnum.ENABLED
    })
  );
}

export function trackNotificationsOptInReminderOnPermissionsOff() {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_REMINDER_ON_PERMISSIONS_OFF",
    buildEventProperties("UX", "control")
  );
}

export function trackNotificationsOptInOpenSettings() {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_OPEN_SETTINGS",
    buildEventProperties("UX", "action")
  );
}

export function trackNotificationsOptInSkipSystemPermissions() {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_SKIP_SYSTEM_PERMISSIONS",
    buildEventProperties("UX", "action")
  );
}
