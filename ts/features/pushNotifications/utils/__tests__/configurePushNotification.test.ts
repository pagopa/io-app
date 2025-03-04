import { constNull, constUndefined } from "fp-ts/lib/function";
import PushNotification from "react-native-push-notification";
import { Platform } from "react-native";
import {
  configurePushNotifications,
  testable
} from "../configurePushNotification";
import { newPushNotificationsToken } from "../../store/actions/installation";
import * as ANALYTICS from "../../analytics";

const mockedDispatch = jest.fn();
jest.mock("../../../../boot/configureStoreAndPersistor", () => ({
  get store() {
    return {
      dispatch: mockedDispatch
    };
  }
}));

const mockCaptureMessage = jest.fn();
jest.mock("@sentry/react-native", () => ({
  captureMessage: (message: string, captureContext?: unknown) => {
    mockCaptureMessage(message, captureContext);
    return "";
  }
}));

describe("configurePushNotifications", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  describe("configurePushNotifications", () => {
    it("should initialize the 'PushNotification' library with proper parameters and callbacks", () => {
      const createChannelSpy = jest
        .spyOn(PushNotification, "createChannel")
        .mockImplementation(constUndefined);
      const configureSpy = jest
        .spyOn(PushNotification, "configure")
        .mockImplementation(constUndefined);

      configurePushNotifications();

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
  describe("onPushNotificationTokenAvailable", () => {
    [undefined, null, {}, { token: undefined }, { token: null }].forEach(
      input => {
        it(`should do nothing and track an anomaly with Sentry if the token is nullish (${JSON.stringify(
          input
        )})`, () => {
          testable!.onPushNotificationTokenAvailable(input as any);
          expect(mockCaptureMessage.mock.calls.length).toBe(1);
          expect(mockCaptureMessage.mock.calls[0].length).toBe(2);
          expect(mockCaptureMessage.mock.calls[0][0]).toEqual(
            `onPushNotificationTokenAvailable received a nullish token (or inner 'token' instance) (${input})`
          );
          expect(mockCaptureMessage.mock.calls[0][1]).toBeUndefined();
          expect(mockedDispatch.mock.calls.length).toBe(0);
        });
      }
    );
    it("should dispatch `newPushNotificationsToken` action and track with `trackNewPushNotificationsTokenGenerated`", () => {
      const mockToken = {
        token: "123"
      };
      const spiedOnAnalytics = jest
        .spyOn(ANALYTICS, "trackNewPushNotificationsTokenGenerated")
        .mockImplementation(constUndefined);

      testable!.onPushNotificationTokenAvailable(mockToken as any);

      expect(mockCaptureMessage.mock.calls.length).toBe(0);
      expect(mockedDispatch.mock.calls.length).toBe(1);
      expect(mockedDispatch.mock.calls[0].length).toBe(1);
      expect(mockedDispatch.mock.calls[0][0]).toEqual(
        newPushNotificationsToken("123")
      );
      expect(spiedOnAnalytics.mock.calls.length).toBe(1);
      expect(spiedOnAnalytics.mock.calls[0].length).toBe(0);
    });
  });
});
