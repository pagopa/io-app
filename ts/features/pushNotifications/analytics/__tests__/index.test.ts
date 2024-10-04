import {
  trackNewPushNotificationsTokenGenerated,
  trackNotificationInstallationTokenNotChanged,
  trackNotificationsOptInOpenSettings,
  trackNotificationsOptInPreviewStatus,
  trackNotificationsOptInReminderOnPermissionsOff,
  trackNotificationsOptInReminderStatus,
  trackNotificationsOptInSkipSystemPermissions,
  trackNotificationStatus,
  trackPushNotificationTokenUploadFailure,
  trackPushNotificationTokenUploadSucceeded,
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "..";
import { PushNotificationsContentTypeEnum } from "../../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../definitions/backend/ReminderStatus";
import * as Mixpanel from "../../../../mixpanel";

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
    void trackNotificationStatus(notificationPermissionsEnabled);
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
    void trackNotificationStatus(notificationPermissionsEnabled);
    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("PUSH_NOTIF_STATE_UPDATED");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "TECH",
      new_notification_status: notificationPermissionsEnabled
    });
  });
});

const getMockMixpanelTrack = () =>
  jest
    .spyOn(Mixpanel, "mixpanelTrack")
    .mockImplementation((_event, _properties) => undefined);
