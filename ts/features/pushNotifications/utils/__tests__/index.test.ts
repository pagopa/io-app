import NotificationsUtils from "react-native-notifications-utils";
import {
  AndroidNotificationChannelId,
  openSystemNotificationSettingsScreen
} from "..";

describe("AndroidNotificationChannelId", () => {
  it("should match expected value", () => {
    expect(AndroidNotificationChannelId).toBe(
      "io_default_notification_channel"
    );
  });
});

describe("openSystemNotificationSettingsScreen", () => {
  it("should call NotificationsUtils.openSettings with proper parameters", () => {
    const openSettingsSpy = jest
      .spyOn(NotificationsUtils, "openSettings")
      .mockImplementation(_channelId => undefined);
    openSystemNotificationSettingsScreen();
    expect(openSettingsSpy.mock.calls.length).toBe(1);
    expect(openSettingsSpy.mock.calls[0][0]).toEqual(
      AndroidNotificationChannelId
    );
  });
});
