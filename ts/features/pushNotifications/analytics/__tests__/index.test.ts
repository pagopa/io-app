import {
  trackNewPushNotificationsTokenGenerated,
  trackNotificationInstallationTokenNotChanged,
  trackNotificationPermissionsStatus,
  trackNotificationsOptInOpenSettings,
  trackNotificationsOptInPreviewStatus,
  trackNotificationsOptInReminderOnPermissionsOff,
  trackNotificationsOptInReminderStatus,
  trackNotificationsOptInSkipSystemPermissions,
  trackPushNotificationBannerDismissAlert,
  trackPushNotificationBannerDismissOutcome,
  trackPushNotificationBannerForceShow,
  trackPushNotificationBannerStillHidden,
  trackPushNotificationsBannerClosure,
  trackPushNotificationsBannerTap,
  trackPushNotificationsBannerVisualized,
  trackPushNotificationSystemPopupShown,
  trackPushNotificationTokenUploadFailure,
  trackPushNotificationTokenUploadSucceeded,
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "..";
import { PushNotificationsContentTypeEnum } from "../../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../definitions/backend/ReminderStatus";
import * as Mixpanel from "../../../../mixpanel";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";

describe("pushNotifications analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it("'trackNotificationInstallationTokenNotChanged' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationInstallationTokenNotChanged();
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH"
    });
  });
  it("'trackNotificationsOptInPreviewStatus' should have expected event name and properties for 'ANONYMOUS' content type", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationsOptInPreviewStatus(
      PushNotificationsContentTypeEnum.ANONYMOUS
    );
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_OPTIN_PREVIEW_STATUS"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      enabled: false
    });
  });
  it("'trackNotificationsOptInPreviewStatus' should have expected event name and properties for 'FULL' content type", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationsOptInPreviewStatus(
      PushNotificationsContentTypeEnum.FULL
    );
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_OPTIN_PREVIEW_STATUS"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      enabled: true
    });
  });
  it("'trackNotificationsOptInReminderStatus' should have expected event name and properties for 'DISABLED' reminder", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationsOptInReminderStatus(ReminderStatusEnum.DISABLED);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_OPTIN_REMINDER_STATUS"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      enabled: false
    });
  });
  it("'trackNotificationsOptInReminderStatus' should have expected event name and properties for 'ENABLED' reminder", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationsOptInReminderStatus(ReminderStatusEnum.ENABLED);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_OPTIN_REMINDER_STATUS"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      enabled: true
    });
  });
  it("'trackNotificationsOptInReminderOnPermissionsOff' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationsOptInReminderOnPermissionsOff();
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_OPTIN_REMINDER_ON_PERMISSIONS_OFF"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "control"
    });
  });
  it("'trackNotificationsOptInOpenSettings' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationsOptInOpenSettings();
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_OPTIN_OPEN_SETTINGS"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action"
    });
  });
  it("'trackNotificationsOptInSkipSystemPermissions' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNotificationsOptInSkipSystemPermissions();
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_OPTIN_SKIP_SYSTEM_PERMISSIONS"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action"
    });
  });
  it("'trackNewPushNotificationsTokenGenerated' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackNewPushNotificationsTokenGenerated();
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH"
    });
  });
  it("'trackPushNotificationTokenUploadSucceeded' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackPushNotificationTokenUploadSucceeded();
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_INSTALLATION_TOKEN_REGISTERED"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH"
    });
  });
  it("'trackPushNotificationTokenUploadFailure' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    const reason = "The reason";
    void trackPushNotificationTokenUploadFailure(reason);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "KO",
      event_type: "error",
      reason
    });
  });
  it("'trackSystemNotificationPermissionScreenShown' should have expected event name and properties", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    void trackSystemNotificationPermissionScreenShown();
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("PUSH_NOTIF_APP_MODAL");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "screen_view"
    });
  });
  it("'trackSystemNotificationPermissionScreenOutcome' should have expected event name and properties for 'activate' input", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    const outcome = "activate";
    void trackSystemNotificationPermissionScreenOutcome(outcome);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "PUSH_NOTIF_APP_MODAL_INTERACTION"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      outcome
    });
  });
  it("'trackSystemNotificationPermissionScreenOutcome' should have expected event name and properties for 'dismiss' input", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    const outcome = "dismiss";
    void trackSystemNotificationPermissionScreenOutcome(outcome);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "PUSH_NOTIF_APP_MODAL_INTERACTION"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      outcome
    });
  });
  it("'trackNotificationStatus' should have expected event name and properties for 'false' input", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    const notificationPermissionsEnabled = false;
    void trackNotificationPermissionsStatus(notificationPermissionsEnabled);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("PUSH_NOTIF_STATE_UPDATED");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH",
      new_notification_status: notificationPermissionsEnabled
    });
  });
  it("'trackNotificationStatus' should have expected event name and properties for 'true' input", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    const notificationPermissionsEnabled = true;
    void trackNotificationPermissionsStatus(notificationPermissionsEnabled);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("PUSH_NOTIF_STATE_UPDATED");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH",
      new_notification_status: notificationPermissionsEnabled
    });
  });
  [MESSAGES_ROUTES.MESSAGES_HOME, SETTINGS_ROUTES.SETTINGS_MAIN].forEach(
    route => {
      it(`'trackPushNotificationsBannerVisualized' should have expected event name and properties for '${route}'`, () => {
        const mockMixpanelTrack = getMockMixpanelTrack();

        void trackPushNotificationsBannerVisualized(route);

        expect(mockMixpanelTrack.mock.calls.length).toBe(1);
        expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(mockMixpanelTrack.mock.calls[0][0]).toBe("BANNER");
        expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "screen_view",
          banner_id: "push_notif_activation",
          banner_page: route,
          banner_landing: "os_notification_settings"
        });
      });
      it(`'trackPushNotificationsBannerTap' should have expected event name and properties for '${route}'`, () => {
        const mockMixpanelTrack = getMockMixpanelTrack();

        void trackPushNotificationsBannerTap(route);

        expect(mockMixpanelTrack.mock.calls.length).toBe(1);
        expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(mockMixpanelTrack.mock.calls[0][0]).toBe("TAP_BANNER");
        expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "action",
          banner_id: "push_notif_activation",
          banner_page: route,
          banner_landing: "os_notification_settings"
        });
      });
      it(`'trackPushNotificationsBannerClosure' should have expected event name and properties for '${route}'`, () => {
        const mockMixpanelTrack = getMockMixpanelTrack();

        void trackPushNotificationsBannerClosure(route);

        expect(mockMixpanelTrack.mock.calls.length).toBe(1);
        expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(mockMixpanelTrack.mock.calls[0][0]).toBe("CLOSE_BANNER");
        expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "action",
          banner_id: "push_notif_activation",
          banner_page: route,
          banner_landing: "os_notification_settings"
        });
      });
    }
  );
  it(`'trackPushNotificationSystemPopupShown' should have expected event name and properties`, () => {
    const mockMixpanelTrack = getMockMixpanelTrack();

    void trackPushNotificationSystemPopupShown();

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("PUSH_NOTIF_SYSTEM_ALERT");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "screen_view"
    });
  });
  it(`'trackPushNotificationBannerDismissAlert' should have expected event name and properties`, () => {
    const mockMixpanelTrack = getMockMixpanelTrack();

    void trackPushNotificationBannerDismissAlert();

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "PUSH_NOTIF_THIRD_DISMISS_ALERT"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "screen_view"
    });
  });
  ["deactivate" as const, "remind_later" as const].forEach(outcome =>
    it(`'trackPushNotificationBannerDismissOutcome' should have expected event name and properties for '${outcome}'`, () => {
      const mockMixpanelTrack = getMockMixpanelTrack();

      void trackPushNotificationBannerDismissOutcome(outcome);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
        "PUSH_NOTIF_THIRD_DISMISS_ALERT_INTERACTION"
      );
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action",
        outcome
      });
    })
  );
  it(`'trackPushNotificationBannerForceShow' should have expected event name and properties`, () => {
    const mockMixpanelTrack = getMockMixpanelTrack();

    void trackPushNotificationBannerForceShow();

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "PUSH_NOTIF_BANNER_FORCE_SHOW"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH",
      event_type: undefined
    });
  });
  it(`'trackPushNotificationBannerStillHidden' should have expected event name and properties`, () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    const unreadMessagesCount = 3;

    void trackPushNotificationBannerStillHidden(unreadMessagesCount);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "PUSH_NOTIF_BANNER_STILL_HIDDEN"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH",
      event_type: undefined,
      unread_count: unreadMessagesCount
    });
  });
});

const getMockMixpanelTrack = () =>
  jest
    .spyOn(Mixpanel, "mixpanelTrack")
    .mockImplementation((_event, _properties) => undefined);
