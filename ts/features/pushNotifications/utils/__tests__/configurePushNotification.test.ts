import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { constUndefined } from "fp-ts/lib/function";
import PushNotification from "react-native-push-notification";
import { Platform } from "react-native";
import {
  configurePushNotifications,
  testable
} from "../configurePushNotification";
import { Store } from "../../../../store/actions/types";
import { newPushNotificationsToken } from "../../store/actions/installation";
import * as ANALYTICS from "../../analytics";
import * as PROFILEPROPERTIES from "../../../../mixpanelConfig/profileProperties";

jest.mock("react-native-i18n", () => ({
  t: (key: string) => key
}));

const mockedDispatch = jest.fn();
const mockedState = {
  entities: {
    messages: {
      allPaginated: {
        archive: {
          data: pot.none,
          lastRequest: O.none,
          lastUpdateTime: new Date(0)
        },
        inbox: {
          data: pot.none,
          lastRequest: O.none,
          lastUpdateTime: new Date(0)
        },
        shownCategory: "INBOX"
      },
      archiving: {
        fromArchiveToInbox: new Set(),
        fromInboxToArchive: new Set(),
        processingResult: undefined,
        status: "disabled"
      }
    }
  },
  persistedPreferences: {
    isMixpanelEnabled: true
  }
};
const mockStore = {
  getState: () => mockedState,
  dispatch: mockedDispatch
} as unknown as Store;

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
      expect(typeof createChannelSpy.mock.calls[0][1]).toBe("function");
      expect(createChannelSpy.mock.calls[0][1](true)).toBe(null);
      expect(createChannelSpy.mock.calls[0][1](false)).toBe(null);
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
          testable!.onPushNotificationTokenAvailable(mockStore, input as any);
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
      const mockedDateNow = new Date("2025-04-02");
      jest.useFakeTimers().setSystemTime(mockedDateNow);
      const mockToken = {
        token: "123"
      };
      const spiedOnAnalytics = jest
        .spyOn(ANALYTICS, "trackNewPushNotificationsTokenGenerated")
        .mockImplementation(constUndefined);
      const spyOnMockedUpdateMixpanelProfileProperties = jest
        .spyOn(PROFILEPROPERTIES, "updateMixpanelProfileProperties")
        .mockImplementation(_state => new Promise(resolve => resolve()));

      testable!.onPushNotificationTokenAvailable(mockStore, mockToken as any);

      expect(mockCaptureMessage.mock.calls.length).toBe(0);
      expect(mockedDispatch.mock.calls.length).toBe(1);
      expect(mockedDispatch.mock.calls[0].length).toBe(1);
      expect(mockedDispatch.mock.calls[0][0]).toEqual(
        newPushNotificationsToken("123")
      );
      expect(spiedOnAnalytics.mock.calls.length).toBe(1);
      expect(spiedOnAnalytics.mock.calls[0].length).toBe(2);
      expect(spiedOnAnalytics.mock.calls[0][0]).toBe(
        mockedDateNow.getTime().toString()
      );
      expect(spiedOnAnalytics.mock.calls[0][1]).toBe(true);
      expect(spyOnMockedUpdateMixpanelProfileProperties.mock.calls.length).toBe(
        1
      );
      expect(
        spyOnMockedUpdateMixpanelProfileProperties.mock.calls[0].length
      ).toBe(1);
      expect(spyOnMockedUpdateMixpanelProfileProperties.mock.calls[0][0]).toBe(
        mockedState
      );
    });
  });
});
