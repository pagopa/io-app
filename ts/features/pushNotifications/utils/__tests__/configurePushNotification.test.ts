import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { constUndefined } from "fp-ts/lib/function";
import PushNotification, {
  ReceivedNotification
} from "react-native-push-notification";
import { Platform } from "react-native";
import {
  configurePushNotifications,
  testable
} from "../configurePushNotification";
import { Store } from "../../../../store/actions/types";
import { newPushNotificationsToken } from "../../store/actions/installation";
import * as ANALYTICS from "../../analytics";
import * as MESSAGESANALYTICS from "../../../messages/analytics";
import * as PROFILEPROPERTIES from "../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../store/reducers/types";
import {
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../messages/store/actions";
import { updateNotificationsPendingMessage } from "../../store/actions/pendingMessage";

jest.mock("@react-native-community/push-notification-ios", () => ({
  FetchResult: {
    NoData: "UIBackgroundFetchResultNoData"
  }
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
          const spiedOnAnalytics = jest
            .spyOn(ANALYTICS, "trackNewPushNotificationsTokenGenerated")
            .mockImplementation(constUndefined);
          const spyOnMockedUpdateMixpanelProfileProperties = jest
            .spyOn(PROFILEPROPERTIES, "updateMixpanelProfileProperties")
            .mockImplementation(_state => new Promise(resolve => resolve()));

          testable!.onPushNotificationTokenAvailable(mockStore, input as any);

          expect(mockCaptureMessage.mock.calls.length).toBe(1);
          expect(mockCaptureMessage.mock.calls[0].length).toBe(2);
          expect(mockCaptureMessage.mock.calls[0][0]).toEqual(
            `onPushNotificationTokenAvailable received a nullish token (or inner 'token' instance) (${input})`
          );
          expect(mockCaptureMessage.mock.calls[0][1]).toBeUndefined();
          expect(mockedDispatch.mock.calls.length).toBe(0);
          expect(spiedOnAnalytics.mock.calls.length).toBe(0);
          expect(
            spyOnMockedUpdateMixpanelProfileProperties.mock.calls.length
          ).toBe(0);
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
  describe("NotificationPayload", () => {
    it("should decode unrelated payload (since it is all optional)", () => {
      const payload = {};
      const result = testable!.NotificationPayload.decode(payload);
      expect(E.isRight(result)).toBe(true);
    });
    it("should decode iOS payload properly", () => {
      const payload = {
        message_id: "01JQZYA0T36WN9ZWR4P4RPXZ6S"
      };
      const result = testable!.NotificationPayload.decode(payload);
      expect(result).toEqual({
        _tag: "Right",
        right: {
          message_id: "01JQZYA0T36WN9ZWR4P4RPXZ6S"
        }
      });
    });
    it("should decode Android payload properly", () => {
      const payload = {
        data: {
          message_id: "01JQZYA0T36WN9ZWR4P4RPXZ6S"
        }
      };
      const result = testable!.NotificationPayload.decode(payload);
      expect(result).toEqual({
        _tag: "Right",
        right: {
          data: { message_id: "01JQZYA0T36WN9ZWR4P4RPXZ6S" }
        }
      });
    });
  });
  describe("getArchiveAndInboxNextAndPreviousPageIndexes", () => {
    (
      [
        [pot.none, pot.none],
        [pot.noneLoading, pot.noneLoading],
        [pot.noneUpdating({}), pot.noneUpdating({})],
        [pot.noneError({}), pot.noneError({})],
        [
          pot.some({
            page: [],
            previous: "prev",
            next: "next"
          }),
          pot.some({
            previous: "prev",
            next: "next"
          })
        ],
        [
          pot.someLoading({
            page: [],
            previous: "prev",
            next: "next"
          }),
          pot.someLoading({
            previous: "prev",
            next: "next"
          })
        ],
        [
          pot.someUpdating(
            {
              page: [],
              previous: "prev",
              next: "next"
            },
            {
              page: [],
              previous: "prev1",
              next: "next1"
            }
          ),
          pot.someUpdating(
            {
              previous: "prev",
              next: "next"
            },
            {
              previous: "prev1",
              next: "next1"
            }
          )
        ],
        [
          pot.someError(
            {
              page: [],
              previous: "prev",
              next: "next"
            },
            {}
          ),
          pot.someError(
            {
              previous: "prev",
              next: "next"
            },
            {}
          )
        ]
      ] as const
    ).forEach(potTuple => {
      it(`should extract 'previous' and 'next' data from input of type '${potTuple[0].kind}'`, () => {
        const state = {
          entities: {
            messages: {
              allPaginated: {
                archive: { data: potTuple[0] },
                inbox: { data: potTuple[0] }
              }
            }
          }
        } as unknown as GlobalState;

        const output =
          testable!.getArchiveAndInboxNextAndPreviousPageIndexes(state);

        expect(output).toEqual({
          archive: potTuple[1],
          inbox: potTuple[1]
        });
      });
    });
  });
  describe("handleForegroundMessageReload", () => {
    (["disabled", "enabled", "processing"] as const).forEach(
      archivingStatus => {
        (
          [
            pot.none,
            pot.noneLoading,
            pot.noneUpdating({}),
            pot.noneError({}),
            pot.some({
              page: [],
              previous: "inboxPrev",
              next: "inboxNext"
            }),
            pot.someLoading({
              page: [],
              previous: "inboxPrev",
              next: "inboxNext"
            }),
            pot.someUpdating(
              {
                page: [],
                previous: "inboxPrev",
                next: "inboxNext"
              },
              {
                page: [],
                previous: "inboxPrev",
                next: "inboxNext"
              }
            ),
            pot.someError(
              {
                page: [],
                previous: "inboxPrev",
                next: "inboxNext"
              },
              {}
            )
          ] as const
        ).forEach(inboxDataPot => {
          (
            [
              pot.none,
              pot.noneLoading,
              pot.noneUpdating({}),
              pot.noneError({}),
              pot.some({
                page: [],
                previous: "inboxPrev",
                next: "inboxNext"
              }),
              pot.someLoading({
                page: [],
                previous: "inboxPrev",
                next: "inboxNext"
              }),
              pot.someUpdating(
                {
                  page: [],
                  previous: "inboxPrev",
                  next: "inboxNext"
                },
                {
                  page: [],
                  previous: "inboxPrev",
                  next: "inboxNext"
                }
              ),
              pot.someError(
                {
                  page: [],
                  previous: "inboxPrev",
                  next: "inboxNext"
                },
                {}
              )
            ] as const
          ).forEach(archiveDataPot => {
            const shouldBlock =
              archivingStatus === "processing" ||
              pot.isLoading(archiveDataPot) ||
              pot.isLoading(inboxDataPot) ||
              pot.isUpdating(archiveDataPot) ||
              pot.isUpdating(inboxDataPot);
            it(`should ${
              shouldBlock ? "not " : ""
            }dispatch proper action for inbox data status of ${
              inboxDataPot.kind
            }, archive data status of ${
              archiveDataPot.kind
            }, when archiving status is ${archivingStatus}`, () => {
              const status = {
                entities: {
                  messages: {
                    allPaginated: {
                      archive: {
                        data: archiveDataPot
                      },
                      inbox: { data: inboxDataPot }
                    },
                    archiving: {
                      status: archivingStatus
                    }
                  }
                }
              } as unknown as GlobalState;
              const testMockStore = {
                dispatch: jest.fn(),
                getState: () => status
              } as unknown as Store;

              testable!.handleForegroundMessageReload(testMockStore);

              if (shouldBlock) {
                expect(
                  (testMockStore.dispatch as jest.Mock).mock.calls.length
                ).toBe(0);
              } else if (
                pot.isSome(status.entities.messages.allPaginated.inbox.data)
              ) {
                expect(
                  (testMockStore.dispatch as jest.Mock).mock.calls.length
                ).toBe(1);
                expect(
                  (testMockStore.dispatch as jest.Mock).mock.calls[0].length
                ).toBe(1);
                expect(
                  (testMockStore.dispatch as jest.Mock).mock.calls[0][0]
                ).toEqual(
                  loadPreviousPageMessages.request({
                    cursor: "inboxPrev",
                    pageSize: 100,
                    filter: {},
                    fromUserAction: false
                  })
                );
              } else {
                expect(
                  (testMockStore.dispatch as jest.Mock).mock.calls.length
                ).toBe(1);
                expect(
                  (testMockStore.dispatch as jest.Mock).mock.calls[0].length
                ).toBe(1);
                expect(
                  (testMockStore.dispatch as jest.Mock).mock.calls[0][0]
                ).toEqual(
                  reloadAllMessages.request({
                    pageSize: 12,
                    filter: {},
                    fromUserAction: false
                  })
                );
              }
            });
          });
        });
      }
    );
  });
  describe("handleMessagePushNotification", () => {
    const messageId = "01JR01MFJYDD7ZEZ828SF0JANG";
    const testMockStore = {
      dispatch: jest.fn(),
      getState: () => ({
        entities: {
          messages: {
            allPaginated: {
              archive: {
                data: pot.none
              },
              inbox: {
                data: pot.none
              }
            },
            archiving: {
              status: "disabled"
            }
          }
        }
      })
    } as unknown as Store;

    it("should call 'trackMessageNotificationTap' and dispatch a 'reloadAllMessages' action if the application is running in foreground", () => {
      const spyOnMockedTrackMessageNotificationTap = jest
        .spyOn(MESSAGESANALYTICS, "trackMessageNotificationTap")
        .mockImplementation();

      testable!.handleMessagePushNotification(
        true,
        messageId,
        testMockStore,
        true
      );

      expect(spyOnMockedTrackMessageNotificationTap.mock.calls.length).toBe(1);
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0].length).toBe(
        2
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][0]).toBe(
        messageId
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][1]).toBe(
        true
      );

      expect((testMockStore.dispatch as jest.Mock).mock.calls.length).toBe(1);
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0].length).toBe(
        1
      );
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0][0]).toEqual(
        reloadAllMessages.request({
          pageSize: 12,
          filter: {},
          fromUserAction: false
        })
      );
    });
    it("should call 'trackMessageNotificationTap' and dispatch a 'updateNotificationsPendingMessage' action if the application is not running in foreground", () => {
      const spyOnMockedTrackMessageNotificationTap = jest
        .spyOn(MESSAGESANALYTICS, "trackMessageNotificationTap")
        .mockImplementation();

      testable!.handleMessagePushNotification(
        false,
        messageId,
        testMockStore,
        true
      );

      expect(spyOnMockedTrackMessageNotificationTap.mock.calls.length).toBe(1);
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0].length).toBe(
        2
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][0]).toBe(
        messageId
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][1]).toBe(
        true
      );

      expect((testMockStore.dispatch as jest.Mock).mock.calls.length).toBe(1);
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0].length).toBe(
        1
      );
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0][0]).toEqual(
        updateNotificationsPendingMessage({
          id: messageId,
          foreground: false
        })
      );
    });
  });
  describe("handleTrackingOfDecodingFailure", () => {
    [false, true].forEach(userAnalyticsOptIn =>
      it(`should call 'trackMessageNotificationParsingFailure' with proper paramters (user optedIn: ${userAnalyticsOptIn})`, () => {
        jest.useFakeTimers().setSystemTime(new Date("2025-04-04"));
        const spiedOnTrackMessageNotificationParsingFailure = jest
          .spyOn(MESSAGESANALYTICS, "trackMessageNotificationParsingFailure")
          .mockImplementation();

        testable!.handleTrackingOfDecodingFailure(
          "A reason",
          userAnalyticsOptIn
        );

        expect(
          spiedOnTrackMessageNotificationParsingFailure.mock.calls.length
        ).toBe(1);
        expect(
          spiedOnTrackMessageNotificationParsingFailure.mock.calls[0].length
        ).toBe(3);
        expect(
          spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][0]
        ).toBe("1743724800000");
        expect(
          spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][1]
        ).toBe("A reason");
        expect(
          spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][2]
        ).toBe(userAnalyticsOptIn);
      })
    );
  });
  describe("handleTrackingOfTokenGeneration", () => {
    [false, true].forEach(userAnalyticsOptIn =>
      it(`should call 'trackNewPushNotificationsTokenGenerated' with proper parameters (userOptedIn: ${userAnalyticsOptIn})`, () => {
        jest.useFakeTimers().setSystemTime(new Date("2025-04-04"));
        const spyOnTrackNewPushNotificationsTokenGenerated = jest
          .spyOn(ANALYTICS, "trackNewPushNotificationsTokenGenerated")
          .mockImplementation();

        testable!.handleTrackingOfTokenGeneration(userAnalyticsOptIn);

        expect(
          spyOnTrackNewPushNotificationsTokenGenerated.mock.calls.length
        ).toBe(1);
        expect(
          spyOnTrackNewPushNotificationsTokenGenerated.mock.calls[0].length
        ).toBe(2);
        expect(
          spyOnTrackNewPushNotificationsTokenGenerated.mock.calls[0][0]
        ).toBe("1743724800000");
        expect(
          spyOnTrackNewPushNotificationsTokenGenerated.mock.calls[0][1]
        ).toBe(userAnalyticsOptIn);
      })
    );
  });
  describe("hasUserOptedInForAnalytics", () => {
    [undefined, null, false, true].forEach(isMixpanelEnabled =>
      it(`'hasUserOptedInForAnalytics' should return '${
        isMixpanelEnabled === true
      }' for input '${isMixpanelEnabled}'`, () => {
        const state = {
          persistedPreferences: {
            isMixpanelEnabled
          }
        } as GlobalState;

        const output = testable!.hasUserOptedInForAnalytics(state);

        expect(output).toBe(isMixpanelEnabled === true);
      })
    );
  });
  describe("messageIdFromPushNotification", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2025-04-04"));
    });
    it("should call 'trackMessageNotificationParsingFailure' and return undefined if the payload decoding fails", () => {
      const spiedOnTrackMessageNotificationParsingFailure = jest
        .spyOn(MESSAGESANALYTICS, "trackMessageNotificationParsingFailure")
        .mockImplementation();

      const output = testable!.messageIdFromPushNotification(
        "asd" as unknown as ReceivedNotification,
        true
      );

      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls.length
      ).toBe(1);
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0].length
      ).toBe(3);
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][0]
      ).toBe("1743724800000");
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][1]
      ).toBe(
        'value ["asd"] at [root] is not a valid [Partial<{ message_id: non empty string, data: Partial<{ message_id: non empty string }> }>]'
      );
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][2]
      ).toBe(true);

      expect(output).toBe(undefined);
    });
    it("should return the messageId if the payload decoding succeeds (iOS)", () => {
      const payload = {
        message_id: "01JQZYA0T36WN9ZWR4P4RPXZ6S"
      } as unknown as ReceivedNotification;

      const output = testable!.messageIdFromPushNotification(payload, true);

      expect(output).toEqual("01JQZYA0T36WN9ZWR4P4RPXZ6S");
    });
    it("should return the messageId if the payload decoding succeeds (Android)", () => {
      const payload = {
        data: {
          message_id: "01JQZYA0T36WN9ZWR4P4RPXZ6S"
        }
      } as unknown as ReceivedNotification;
      const output = testable!.messageIdFromPushNotification(payload, true);
      expect(output).toEqual("01JQZYA0T36WN9ZWR4P4RPXZ6S");
    });
    it("should call 'trackMessageNotificationParsingFailure' and return undefined if the payload decoding succeeds but the messageId is not present", () => {
      const payload = {
        data: {}
      } as unknown as ReceivedNotification;
      const spiedOnTrackMessageNotificationParsingFailure = jest
        .spyOn(MESSAGESANALYTICS, "trackMessageNotificationParsingFailure")
        .mockImplementation();
      const output = testable!.messageIdFromPushNotification(payload, true);
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls.length
      ).toBe(1);
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0].length
      ).toBe(3);
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][0]
      ).toBe("1743724800000");
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][1]
      ).toBe("No 'messageId' found in push notification payload data");
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][2]
      ).toBe(true);
      expect(output).toBe(undefined);
    });
  });
  describe("onPushNotificationReceived", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2025-04-04"));
    });
    const testMockStore = {
      dispatch: jest.fn(),
      getState: () =>
        ({
          entities: {
            messages: {
              allPaginated: {
                archive: {
                  data: pot.none
                },
                inbox: {
                  data: pot.none
                }
              },
              archiving: {
                status: "disabled"
              }
            }
          },
          persistedPreferences: {
            isMixpanelEnabled: true
          }
        } as unknown as GlobalState)
    } as unknown as Store;
    it("Should just call 'notification.finish' with proper parameters if the notification is not from a user interaction", () => {
      const notification = {
        finish: jest.fn(),
        userInteraction: false
      } as unknown as ReceivedNotification;

      testable!.onPushNotificationReceived(notification, mockStore);

      expect((notification.finish as jest.Mock).mock.calls.length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0].length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0][0]).toEqual(
        "UIBackgroundFetchResultNoData"
      );
    });
    it("Should just call 'notification.finish' with proper parameters if there is no messageId in the notification payload", () => {
      const notification = {
        finish: jest.fn(),
        userInteraction: true
      } as unknown as ReceivedNotification;
      const spiedOnTrackMessageNotificationParsingFailure = jest
        .spyOn(MESSAGESANALYTICS, "trackMessageNotificationParsingFailure")
        .mockImplementation();

      testable!.onPushNotificationReceived(notification, mockStore);

      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls.length
      ).toBe(1);
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0].length
      ).toBe(3);
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][0]
      ).toBe("1743724800000");
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][1]
      ).toBe("No 'messageId' found in push notification payload data");
      expect(
        spiedOnTrackMessageNotificationParsingFailure.mock.calls[0][2]
      ).toBe(true);

      expect((notification.finish as jest.Mock).mock.calls.length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0].length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0][0]).toEqual(
        "UIBackgroundFetchResultNoData"
      );
    });
    it("Should track notification tap and dispatch a reloadAllMessages action if the notification has been received while in foreground, also calling 'notification.finish' with proper parameters", () => {
      const messageId = "01JQZYA0T36WN9ZWR4P4RPXZ6S";
      const notification = {
        finish: jest.fn(),
        userInteraction: true,
        message_id: messageId,
        foreground: true
      } as unknown as ReceivedNotification;

      const spyOnMockedTrackMessageNotificationTap = jest
        .spyOn(MESSAGESANALYTICS, "trackMessageNotificationTap")
        .mockImplementation();

      testable!.onPushNotificationReceived(notification, testMockStore);

      expect(spyOnMockedTrackMessageNotificationTap.mock.calls.length).toBe(1);
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0].length).toBe(
        2
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][0]).toBe(
        messageId
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][1]).toBe(
        true
      );

      expect((testMockStore.dispatch as jest.Mock).mock.calls.length).toBe(1);
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0].length).toBe(
        1
      );
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0][0]).toEqual(
        reloadAllMessages.request({
          pageSize: 12,
          filter: {},
          fromUserAction: false
        })
      );

      expect((notification.finish as jest.Mock).mock.calls.length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0].length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0][0]).toEqual(
        "UIBackgroundFetchResultNoData"
      );
    });
    it("Should track notification tap and dispatch a updateNotificationsPendingMessage action if the notification has been received while in background, also calling 'notification.finish' with proper parameters", () => {
      const messageId = "01JQZYA0T36WN9ZWR4P4RPXZ6S";
      const notification = {
        finish: jest.fn(),
        userInteraction: true,
        message_id: messageId,
        foreground: false
      } as unknown as ReceivedNotification;

      const spyOnMockedTrackMessageNotificationTap = jest
        .spyOn(MESSAGESANALYTICS, "trackMessageNotificationTap")
        .mockImplementation();

      testable!.onPushNotificationReceived(notification, testMockStore);

      expect(spyOnMockedTrackMessageNotificationTap.mock.calls.length).toBe(1);
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0].length).toBe(
        2
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][0]).toBe(
        messageId
      );
      expect(spyOnMockedTrackMessageNotificationTap.mock.calls[0][1]).toBe(
        true
      );

      expect((testMockStore.dispatch as jest.Mock).mock.calls.length).toBe(1);
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0].length).toBe(
        1
      );
      expect((testMockStore.dispatch as jest.Mock).mock.calls[0][0]).toEqual(
        updateNotificationsPendingMessage({
          id: messageId,
          foreground: false
        })
      );

      expect((notification.finish as jest.Mock).mock.calls.length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0].length).toBe(1);
      expect((notification.finish as jest.Mock).mock.calls[0][0]).toEqual(
        "UIBackgroundFetchResultNoData"
      );
    });
  });
});
