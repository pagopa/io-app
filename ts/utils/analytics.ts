import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import { euCovidCertificateEnabled } from "../config";
import { PushNotificationsContentTypeEnum } from "../../definitions/backend/PushNotificationsContentType";
import { mixpanelTrack } from "../mixpanel";
import { ReminderStatusEnum } from "../../definitions/backend/ReminderStatus";
import { ServicesDetailLoadTrack } from "../sagas/startup/loadServiceDetailRequestHandler";

const blackListRoutes: ReadonlyArray<string> = [];

// the routes contained in this set won't be tracked in SCREEN_CHANGE_V2 event
export const noAnalyticsRoutes = new Set<string>(
  // eslint-disable-next-line sonarjs/no-empty-collection
  blackListRoutes.concat(
    euCovidCertificateEnabled ? Object.values(EUCOVIDCERT_ROUTES) : []
  )
);

// Notifications related events

export function trackNotificationInstallationTokenNotChanged() {
  void mixpanelTrack("NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED");
}

export function trackNotificationsOptInPreviewStatus(
  contentType: PushNotificationsContentTypeEnum
) {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_PREVIEW_STATUS", {
    enabled: contentType === PushNotificationsContentTypeEnum.FULL
  });
}

export function trackNotificationsOptInReminderStatus(
  reminderStatus: ReminderStatusEnum
) {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_REMINDER_STATUS", {
    enabled: reminderStatus === ReminderStatusEnum.ENABLED
  });
}

export function trackConflictingNotificationSettings() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_REMINDER_ON_PERMISSIONS_OFF");
}

export function trackOpenSystemNotificationSettings() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_OPEN_SETTINGS");
}

export function trackSkipSystemNotificationPermissions() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_SKIP_SYSTEM_PERMISSIONS");
}

export function trackNotificationsPreferencesPreviewStatus(enabled: boolean) {
  void mixpanelTrack("NOTIFICATIONS_PREFERENCES_PREVIEW_STATUS", {
    enabled
  });
}

export function trackNotificationsPreferencesReminderStatus(enabled: boolean) {
  void mixpanelTrack("NOTIFICATIONS_PREFERENCES_REMINDER_STATUS", {
    enabled
  });
}

// End of Notifications related events

// Services related events

export function trackServiceDetailLoadingStatistics(
  trackingStats: ServicesDetailLoadTrack
) {
  void mixpanelTrack("SERVICES_DETAIL_LOADING_STATS", {
    ...trackingStats,
    // drop servicesId since it is not serialized in mixpanel and it could be an extra overhead on sending
    servicesId: undefined
  });
}

// End of Services related events

// Lollipop events
export function trackLollipopKeyGenerationSuccess(keyType?: string) {
  void mixpanelTrack("LOLLIPOP_KEY_GENERATION_SUCCESS", {
    kty: keyType
  });
}

export function trackLollipopKeyGenerationFailure(reason: string) {
  void mixpanelTrack("LOLLIPOP_KEY_GENERATION_FAILURE", {
    reason
  });
}

export function trackLollipopIdpLoginFailure(reason: string) {
  void mixpanelTrack("LOLLIPOP_IDP_LOGIN_FAILURE", {
    reason
  });
}

// End of lollipop events

// Keychain
// workaround to send keychainError for Pixel devices
// TODO: REMOVE AFTER FIXING https://pagopa.atlassian.net/jira/software/c/projects/IABT/boards/92?modal=detail&selectedIssue=IABT-1441
export function trackKeychainGetFailure(reason: string | undefined) {
  if (reason) {
    void mixpanelTrack("KEY_CHAIN_GET_GENERIC_PASSWORD_FAILURE", {
      reason
    });
  }
}
