import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import { euCovidCertificateEnabled } from "../config";
import { PushNotificationsContentTypeEnum } from "../../definitions/backend/PushNotificationsContentType";
import { mixpanelTrack } from "../mixpanel";
import { ReminderStatusEnum } from "../../definitions/backend/ReminderStatus";

const blackListRoutes: ReadonlyArray<string> = [];

// the routes contained in this set won't be tracked in SCREEN_CHANGE_V2 event
export const noAnalyticsRoutes = new Set<string>(
  // eslint-disable-next-line sonarjs/no-empty-collection
  blackListRoutes.concat(
    euCovidCertificateEnabled ? Object.values(EUCOVIDCERT_ROUTES) : []
  )
);

// Premium events

export function trackMessageNotificationTap(isForeground: boolean) {
  const key = isForeground ? "NOTIFICATIONS_MESSAGE_FOREGROUND_TAP" : "NOTIFICATIONS_MESSAGE_BACKGROUND_TAP";
  void mixpanelTrack(key);
};

export function trackOpenMessageFromNotification() {
  void mixpanelTrack("NOTIFICATION_OPEN_MESSAGE");
};

export function trackIdentificationRequest() {
  void mixpanelTrack("IDENTIFICATION_REQUEST");
};

export function trackNotificationsOptInPreviewStatus(contentType: PushNotificationsContentTypeEnum) {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_PREVIEW_STATUS", {
    enabled: (contentType === PushNotificationsContentTypeEnum.FULL)
  });
};

export function trackNotificationsOptInReminderStatus(reminderStatus: ReminderStatusEnum) {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_REMINDER_STATUS", {
    enabled: (reminderStatus === ReminderStatusEnum.ENABLED)
  });
};

export function trackConflictingNotificationSettings() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_REMINDER_ON_PERMISSIONS_OFF");
};

export function trackOpenSystemNotificationSettings() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_OPEN_SETTINGS");
};

export function trackSkipSystemNotificationPermissions() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_SKIP_SYSTEM_PERMISSIONS");
};

export function trackNotificationsPreferencesPreviewStatus(enabled: boolean) {
  void mixpanelTrack("NOTIFICATIONS_PREFERENCES_PREVIEW_STATUS", {
    enabled
  });
};

export const trackNotificationsPreferencesReminderStatus = (enabled: boolean) => {
  void mixpanelTrack("NOTIFICATIONS_PREFERENCES_REMINDER_STATUS", {
    enabled
  });
};
