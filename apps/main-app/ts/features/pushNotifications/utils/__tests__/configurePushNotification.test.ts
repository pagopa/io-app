import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import * as PROFILEPROPERTIES from "../../../../mixpanelConfig/profileProperties";
import { Store } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import * as APPANALYTICS from "../../../../utils/analytics";
import * as ANALYTICS from "../../analytics";
import { newPushNotificationsToken } from "../../store/actions/installation";
import {
  configurePushNotificationListeners,
  setupAndroidNotificationChannel,
  testable
} from "../configurePushNotification";
import * as HANDLERS from "../pushNotificationHandlers";

const {
  unhandledForegroundNotificationIds,
  handleColdStartNotification,
  onNotificationResponse,
  onPushNotificationTokenReceived,
  hasUserOptedInForAnalytics
} = testable!;

const getMockSubscription = () =>
  jest.fn().mockImplementation(() => ({ remove: jest.fn() }));
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  addPushTokenListener: getMockSubscription(),
  addNotificationReceivedListener: getMockSubscription(),
  addNotificationResponseReceivedListener: getMockSubscription(),
  getDevicePushTokenAsync: jest.fn(),
  getLastNotificationResponse: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
  dismissNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: {
    UNKNOWN: 0,
    UNSPECIFIED: 1,
    NONE: 2,
    MIN: 3,
    LOW: 4,
    DEFAULT: 5,
    HIGH: 6,
    MAX: 7
  }
}));

jest.mock("../pushNotificationHandlers");
jest.mock("../../analytics");
jest.mock("../../../../utils/analytics");
jest.mock("../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn().mockResolvedValue(undefined)
}));

const mockedNotifications = jest.mocked(Notifications);
const trackNewToken = ANALYTICS.trackNewPushNotificationsTokenGenerated;
const updateMixpanel = PROFILEPROPERTIES.updateMixpanelProfileProperties;
const handleInteraction = HANDLERS.handleMessageNotificationInteraction;

const CHANNEL_ID = "io_default_notification_channel";
const CHANNEL_NAME = "IO default notification channel";
const FAKE_NOW = new Date("2025-06-01T12:00:00.000Z").getTime();

const getFunctionMock = <T extends jest.Mock>(func: T) =>
  func.mock.calls[0][0] as Parameters<T>[0];

const makeGlobalState = (isMixpanelEnabled: boolean | null): GlobalState =>
  ({ persistedPreferences: { isMixpanelEnabled } }) as unknown as GlobalState;

const makeNotificationResponse = (identifier: null | string) =>
  ({
    notification: {
      request: { identifier }
    }
  }) as Notifications.NotificationResponse;

const mockDispatch = jest.fn();
const mockGetState = jest.fn(() => makeGlobalState(null));
const mockStore = {
  dispatch: mockDispatch,
  getState: mockGetState
} as unknown as Store;

describe("configurePushNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unhandledForegroundNotificationIds.clear();
    // eslint-disable-next-line functional/immutable-data
    Platform.OS = "ios";
  });

  describe("setupAndroidNotificationChannel", () => {
    it("does not call setNotificationChannelAsync on non-Android platforms", async () => {
      await setupAndroidNotificationChannel();
      expect(
        mockedNotifications.setNotificationChannelAsync
      ).not.toHaveBeenCalled();
    });

    it("calls setNotificationChannelAsync with the correct parameters on Android", async () => {
      // eslint-disable-next-line functional/immutable-data
      Platform.OS = "android";
      await setupAndroidNotificationChannel();

      expect(
        mockedNotifications.setNotificationChannelAsync
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedNotifications.setNotificationChannelAsync
      ).toHaveBeenCalledWith(CHANNEL_ID, {
        name: CHANNEL_NAME,
        importance: mockedNotifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default"
      });
    });
  });

  describe("configurePushNotificationListeners", () => {
    const expectListenerCallCount = (callCount: number) => {
      expect(mockedNotifications.addPushTokenListener).toHaveBeenCalledTimes(
        callCount
      );
      expect(
        mockedNotifications.addNotificationReceivedListener
      ).toHaveBeenCalledTimes(callCount);
      expect(
        mockedNotifications.addNotificationResponseReceivedListener
      ).toHaveBeenCalledTimes(callCount);
      expect(mockedNotifications.getDevicePushTokenAsync).toHaveBeenCalledTimes(
        callCount
      );
      expect(
        mockedNotifications.getLastNotificationResponse
      ).toHaveBeenCalledTimes(callCount);
    };
    it("calls all listener registration and device token functions", () => {
      expectListenerCallCount(0);
      configurePushNotificationListeners(mockStore);
      expectListenerCallCount(1);
    });

    it("calls .remove() on all three subscriptions when the returned cleanup function is invoked", () => {
      const cleanup = configurePushNotificationListeners(mockStore);

      const tokenSub =
        mockedNotifications.addPushTokenListener.mock.results[0].value;
      const receivedSub =
        mockedNotifications.addNotificationReceivedListener.mock.results[0]
          .value;
      const responseSub =
        mockedNotifications.addNotificationResponseReceivedListener.mock
          .results[0].value;

      expect(tokenSub.remove).toHaveBeenCalledTimes(0);
      expect(receivedSub.remove).toHaveBeenCalledTimes(0);
      expect(responseSub.remove).toHaveBeenCalledTimes(0);

      cleanup();

      expect(tokenSub.remove).toHaveBeenCalledTimes(1);
      expect(receivedSub.remove).toHaveBeenCalledTimes(1);
      expect(responseSub.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe("token listener callback", () => {
    beforeEach(() => jest.useFakeTimers().setSystemTime(FAKE_NOW));
    afterEach(() => jest.useRealTimers());

    test.each([
      { label: "null", tokenData: null },
      { label: "undefined", tokenData: undefined },
      { label: "empty string", tokenData: "" }
    ])(
      "calls trackAppCaughtError and does not dispatch when token.data is $label",
      ({ tokenData }) => {
        onPushNotificationTokenReceived(mockStore)({ data: tokenData });

        expect(APPANALYTICS.trackAppCaughtError).toHaveBeenCalledWith(
          "onPushNotificationTokenAvailable",
          expect.stringContaining("nullish"),
          undefined
        );
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(trackNewToken).not.toHaveBeenCalled();
        expect(updateMixpanel).not.toHaveBeenCalled();
      }
    );

    test.each([
      { label: "opted in", isMixpanelEnabled: true },
      { label: "opted out", isMixpanelEnabled: false }
    ])(
      "dispatches token and tracks with correct opt-in value when user is $label",
      ({ isMixpanelEnabled }) => {
        const state = makeGlobalState(isMixpanelEnabled);

        mockGetState.mockReturnValue(state);

        onPushNotificationTokenReceived(mockStore)({ data: "some-token" });

        expect(mockDispatch).toHaveBeenCalledWith(
          newPushNotificationsToken("some-token")
        );
        expect(trackNewToken).toHaveBeenCalledWith(
          FAKE_NOW.toString(),
          isMixpanelEnabled
        );
        expect(updateMixpanel).toHaveBeenCalledWith(state);
      }
    );
  });

  describe("notification received listener callback", () => {
    it("adds the notification identifier to unhandledForegroundNotificationIds", () => {
      const notifId = "notif-id-received-123";
      configurePushNotificationListeners(mockStore);
      const receivedCallback = getFunctionMock(
        mockedNotifications.addNotificationReceivedListener
      );

      expect(unhandledForegroundNotificationIds.has(notifId)).toBe(false);
      receivedCallback({
        request: {
          identifier: notifId
        }
      } as Notifications.Notification);

      expect(unhandledForegroundNotificationIds.has(notifId)).toBe(true);
    });
  });

  describe("notification response listener callback", () => {
    const notificationReceivedCallback = (
      params: Notifications.NotificationResponse
    ) =>
      getFunctionMock(
        mockedNotifications.addNotificationResponseReceivedListener
      )(params);

    beforeEach(() => {
      configurePushNotificationListeners(mockStore);
    });

    test.each([
      {
        label: "foreground",
        notifId: "foreground-notif-id",
        inSet: true,
        expectedFlag: true
      },
      {
        label: "background",
        notifId: "background-notif-id",
        inSet: false,
        expectedFlag: false
      }
    ])(
      "derives receivedInForeground=$expectedFlag from the unhandled set for a $label notification, and also removes the notification identifier from the set if it was present",
      ({ notifId, inSet, expectedFlag }) => {
        if (inSet) {
          unhandledForegroundNotificationIds.add(notifId);
        }

        notificationReceivedCallback(makeNotificationResponse(notifId));

        expect(handleInteraction).toHaveBeenCalledWith(
          expect.anything(),
          expectedFlag,
          expect.anything(),
          expect.any(Boolean)
        );
        expect(unhandledForegroundNotificationIds.has(notifId)).toBe(false);
      }
    );
  });

  describe("onNotificationResponse", () => {
    it("does nothing for a ghost notification with null identifier", () => {
      const checkEarlyExit = () => {
        expect(
          mockedNotifications.clearLastNotificationResponse
        ).not.toHaveBeenCalled();
        expect(handleInteraction).not.toHaveBeenCalled();
        expect(
          mockedNotifications.dismissNotificationAsync
        ).not.toHaveBeenCalled();
      };
      checkEarlyExit();

      onNotificationResponse(makeNotificationResponse(null), false, mockStore);

      checkEarlyExit();
    });

    test.each([
      {
        label: "foreground, opted in",
        receivedInForeground: true,
        isMixpanelEnabled: true
      },
      {
        label: "background, opted out",
        receivedInForeground: false,
        isMixpanelEnabled: false
      }
    ])(
      "clears last response, delegates to handleMessageNotificationInteraction with correct flags, and dismisses notification ($label)",
      ({ receivedInForeground, isMixpanelEnabled }) => {
        mockGetState.mockReturnValue(makeGlobalState(isMixpanelEnabled));
        const notifId = "response-test-id";
        const response = makeNotificationResponse(notifId);

        expect(
          mockedNotifications.clearLastNotificationResponse
        ).toHaveBeenCalledTimes(0);
        expect(handleInteraction).toHaveBeenCalledTimes(0);
        expect(
          mockedNotifications.dismissNotificationAsync
        ).toHaveBeenCalledTimes(0);

        onNotificationResponse(response, receivedInForeground, mockStore);

        expect(
          mockedNotifications.clearLastNotificationResponse
        ).toHaveBeenCalledTimes(1);
        expect(handleInteraction).toHaveBeenCalledWith(
          response,
          receivedInForeground,
          mockStore,
          isMixpanelEnabled
        );
        expect(
          mockedNotifications.dismissNotificationAsync
        ).toHaveBeenCalledWith(notifId);
      }
    );
  });

  describe("cold start notification handling", () => {
    it("does not call handleMessageNotificationInteraction when there is no last notification response", () => {
      mockedNotifications.getLastNotificationResponse.mockReturnValue(null);
      handleColdStartNotification(mockStore);

      expect(handleInteraction).not.toHaveBeenCalled();
    });

    it("calls handleMessageNotificationInteraction with the last notification response", () => {
      const lastResponse = makeNotificationResponse("cold-start-id");
      mockedNotifications.getLastNotificationResponse.mockReturnValue(
        lastResponse
      );
      expect(handleInteraction).not.toHaveBeenCalled();

      handleColdStartNotification(mockStore);

      expect(handleInteraction).toHaveBeenCalledWith(
        lastResponse,
        expect.any(Boolean),
        mockStore,
        expect.any(Boolean)
      );
    });
  });

  describe("testable.hasUserOptedInForAnalytics", () => {
    test.each([
      { label: "true", mixpanelEnabled: true as boolean | null },
      { label: "false", mixpanelEnabled: false as boolean | null },
      { label: "null", mixpanelEnabled: null as boolean | null }
    ])(
      "returns $label when isMixpanelEnabled is $mixpanelEnabled",
      ({ mixpanelEnabled }) => {
        expect(
          hasUserOptedInForAnalytics(makeGlobalState(mixpanelEnabled))
        ).toBe(mixpanelEnabled ?? false);
      }
    );
  });
});
