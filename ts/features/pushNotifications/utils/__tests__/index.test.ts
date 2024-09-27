import NotificationsUtils from "react-native-notifications-utils";
import { openSystemNotificationSettingsScreen } from "..";

describe("openSystemNotificationSettingsScreen", () => {
  it("should call NotificationsUtils.openSettings with proper parameters", () => {
    const openSettingsSpy = jest
      .spyOn(NotificationsUtils, "openSettings")
      .mockImplementation(_channelId => undefined);
    openSystemNotificationSettingsScreen();
    expect(openSettingsSpy.mock.calls.length).toBe(0);
  });
});
