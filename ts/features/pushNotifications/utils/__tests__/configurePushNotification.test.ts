import { constNull, constUndefined } from "fp-ts/lib/function";
import PushNotification from "react-native-push-notification";
import { Platform } from "react-native";
import { Store } from "redux";
import configurePushNotifications from "../configurePushNotification";
import { GlobalState } from "../../../../store/reducers/types";
import { Action } from "../../../../store/actions/types";

jest.mock("../../../../boot/configureStoreAndPersistor", () => ({
  get store() {
    return {
      dispatch: jest.fn()
    };
  }
}));

describe("configurePushNotifications", () => {
  it("should initialize the 'PushNotification' library with proper parameters and callbacks", () => {
    const createChannelSpy = jest
      .spyOn(PushNotification, "createChannel")
      .mockImplementation(constUndefined);
    const configureSpy = jest
      .spyOn(PushNotification, "configure")
      .mockImplementation(constUndefined);

    const mockStore = {} as Store<GlobalState, Action>;
    configurePushNotifications(mockStore);

    expect(createChannelSpy.mock.calls.length).toBe(1);
    expect(createChannelSpy.mock.calls[0][0]).toEqual({
      channelId: "io_default_notification_channel",
      channelName: "IO default notification channel",
      playSound: true,
      soundName: "default",
      importance: 4,
      vibrate: true
    });
    expect(createChannelSpy.mock.calls[0][1]).toEqual(constNull);
    expect(configureSpy.mock.calls.length).toBe(1);
    const pushNotificationOptions = configureSpy.mock.calls[0][0];
    expect(pushNotificationOptions.onRegister).toBeDefined();
    expect(typeof pushNotificationOptions.onRegister).toBe("function");
    expect(pushNotificationOptions.onNotification).toBeDefined();
    expect(typeof pushNotificationOptions.onNotification).toBe("function");
    expect(pushNotificationOptions.requestPermissions).toEqual(
      Platform.OS !== "ios"
    );
  });
});
