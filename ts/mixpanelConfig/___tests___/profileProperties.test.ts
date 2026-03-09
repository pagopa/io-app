import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import * as PUSHUTILS from "../../features/pushNotifications/utils";
import { ServicesState } from "../../features/services/common/store/reducers";
import { ServicePreferenceResponse } from "../../features/services/details/types/ServicePreferenceResponse";
import { GlobalState } from "../../store/reducers/types";
import * as BIOMETRICS from "../../utils/biometrics";
import * as lifecycleSelectors from "../../features/itwallet/lifecycle/store/selectors";
import { updateMixpanelProfileProperties } from "../profileProperties";

// eslint-disable-next-line functional/no-let
let mockIsMixpanelInitialized = true;
const mockedSet = jest.fn();
jest.mock("../../mixpanel", () => ({
  getPeople: () => ({
    set: mockedSet
  }),
  isMixpanelInstanceInitialized: () => mockIsMixpanelInitialized
}));

const pnServiceId = "01G40DWQGKY5GRWSNM4303VNRP" as ServiceId;

const generateBaseProfileProperties = () => ({
  BIOMETRIC_TECHNOLOGY: "FACE_ID",
  CGN_STATUS: "not_active",
  CDC_STATUS: 0,
  FONT_PREFERENCE: "comfortable",
  THEME_PREFERENCE: "light",
  LOGIN_METHOD: "not set",
  LOGIN_SESSION: "365",
  NOTIFICATION_CONFIGURATION: "not set",
  NOTIFICATION_PERMISSION: "disabled",
  NOTIFICATION_TOKEN: "no",
  SAVED_PAYMENT_METHOD: 0,
  SEND_STATUS: "active",
  SERVICE_CONFIGURATION: "AUTO",
  TOS_ACCEPTED_VERSION: 1,
  TRACKING: "accepted",
  WELFARE_STATUS: []
});

describe("profileProperties", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  describe("updateMixpanelProfileProperties", () => {
    /** === === === === === === === === ===
     * NOTIFICATION_CONFIGURATION
     * NOTIFICATION_PERMISSION
     * NOTIFICATION_TOKEN
     * === === === === === === === === === */
    [
      [undefined, undefined, "not set"],
      [undefined, ReminderStatusEnum.DISABLED, "not set"],
      [undefined, ReminderStatusEnum.ENABLED, "not set"],
      [PushNotificationsContentTypeEnum.ANONYMOUS, undefined, "not set"],
      [
        PushNotificationsContentTypeEnum.ANONYMOUS,
        ReminderStatusEnum.DISABLED,
        "none"
      ],
      [
        PushNotificationsContentTypeEnum.ANONYMOUS,
        ReminderStatusEnum.ENABLED,
        "reminder"
      ],
      [PushNotificationsContentTypeEnum.FULL, undefined, "not set"],
      [
        PushNotificationsContentTypeEnum.FULL,
        ReminderStatusEnum.DISABLED,
        "preview"
      ],
      [
        PushNotificationsContentTypeEnum.FULL,
        ReminderStatusEnum.ENABLED,
        "complete"
      ]
    ].forEach(pushContentReminderTuple =>
      [
        [false, "disabled"],
        [true, "enabled"]
      ].forEach(notificationPermissionTuple =>
        [
          [undefined, "no"],
          ["", "no"],
          [" ", "no"],
          ["aNotificationToken", "yes"]
        ].forEach(notificationTokenTuple =>
          it(`should call 'mixpanel.getPeople().set' with proper parameter's value for input
({
    notificationPermission: ${notificationPermissionTuple[0]}
    notificationToken: ${notificationTokenTuple[0]}
    push_notifications_content_type: ${pushContentReminderTuple[0]},
    reminder_status: ${pushContentReminderTuple[1]},
})
`, async () => {
            mockIsMixpanelInitialized = true;
            const state = generateMockedGlobalState(
              notificationTokenTuple[0],
              pushContentReminderTuple[0] as PushNotificationsContentTypeEnum,
              pushContentReminderTuple[1] as ReminderStatusEnum
            );
            jest
              .spyOn(BIOMETRICS, "getBiometricsType")
              .mockImplementation(() => Promise.resolve("FACE_ID"));
            jest
              .spyOn(PUSHUTILS, "checkNotificationPermissions")
              .mockImplementation(() =>
                Promise.resolve(notificationPermissionTuple[0] as boolean)
              );

            await updateMixpanelProfileProperties(state);

            expect(mockedSet.mock.calls.length).toBe(1);
            expect(mockedSet.mock.calls[0].length).toBe(1);
            expect(mockedSet.mock.calls[0][0]).toEqual({
              ...generateBaseProfileProperties(),
              NOTIFICATION_CONFIGURATION: pushContentReminderTuple[2],
              NOTIFICATION_PERMISSION: notificationPermissionTuple[1],
              NOTIFICATION_TOKEN: notificationTokenTuple[1]
            });
          })
        )
      )
    );
    /** === === === === === === === === ===
     * SEND_STATUS
     * === === === === === === === === === */
    const generatePNServicePreferences = (
      inbox: boolean
    ): ServicePreferenceResponse => ({
      id: pnServiceId,
      kind: "success",
      value: {
        inbox,
        can_access_message_read_status: false,
        email: false,
        push: false,
        settings_version: 0
      }
    });
    const sendStatusGlobalStatuses = [
      [
        {
          remoteConfig: O.none
        },
        "unknown"
      ],
      [
        {
          remoteConfig: O.some({
            pn: {}
          })
        },
        "unknown"
      ],
      [pot.none, "unknown"],
      [pot.noneLoading, "unknown"],
      [pot.noneUpdating(generatePNServicePreferences(true)), "unknown"],
      [pot.noneError({ id: pnServiceId, kind: "timeout" }), "unknown"],
      [pot.some(generatePNServicePreferences(false)), "not_active"],
      [pot.some(generatePNServicePreferences(true)), "active"],
      [pot.someLoading(generatePNServicePreferences(false)), "not_active"],
      [pot.someLoading(generatePNServicePreferences(true)), "active"],
      [
        pot.someUpdating(
          generatePNServicePreferences(false),
          generatePNServicePreferences(false)
        ),
        "not_active"
      ],
      [
        pot.someUpdating(
          generatePNServicePreferences(false),
          generatePNServicePreferences(true)
        ),
        "not_active"
      ],
      [
        pot.someUpdating(
          generatePNServicePreferences(true),
          generatePNServicePreferences(false)
        ),
        "active"
      ],
      [
        pot.someUpdating(
          generatePNServicePreferences(true),
          generatePNServicePreferences(true)
        ),
        "active"
      ],
      [
        pot.someError(generatePNServicePreferences(false), {
          id: pnServiceId,
          kind: "timeout"
        }),
        "not_active"
      ],
      [
        pot.someError(generatePNServicePreferences(true), {
          id: pnServiceId,
          kind: "timeout"
        }),
        "active"
      ]
    ] as const;
    sendStatusGlobalStatuses.forEach(([testData, expectedSendStatus]) => {
      it(`should report 'SEND_STATUS' as '${expectedSendStatus}' for input data ${JSON.stringify(
        testData
      )}`, async () => {
        mockIsMixpanelInitialized = true;
        const status = generateMockedGlobalState(
          undefined,
          undefined,
          undefined
        );

        const testStatus = (
          "remoteConfig" in testData
            ? { ...status, ...testData }
            : {
                ...status,
                features: {
                  ...status.features,
                  services: {
                    ...status.features.services,
                    details: {
                      ...status.features.services.details,
                      preferencesById: {
                        ...status.features.services.details.preferencesById,
                        [pnServiceId]: testData
                      }
                    }
                  }
                }
              }
        ) as GlobalState;

        jest
          .spyOn(BIOMETRICS, "getBiometricsType")
          .mockImplementation(() => Promise.resolve("FACE_ID"));
        jest
          .spyOn(PUSHUTILS, "checkNotificationPermissions")
          .mockImplementation(() => Promise.resolve(false));
        jest
          .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
          .mockReturnValue(false);

        await updateMixpanelProfileProperties(testStatus);

        expect(mockedSet.mock.calls.length).toBe(1);
        expect(mockedSet.mock.calls[0].length).toBe(1);
        expect(mockedSet.mock.calls[0][0]).toEqual({
          ...generateBaseProfileProperties(),
          SEND_STATUS: expectedSendStatus
        });
      });
    });
  });
  it("should not do anything if 'isMixpanelInstanceInitialized' returns 'false'", async () => {
    mockIsMixpanelInitialized = false;
    const fakeState = {} as GlobalState;

    await updateMixpanelProfileProperties(fakeState);

    expect(mockedSet.mock.calls.length).toBe(0);
  });
});

const generateMockedGlobalState = (
  notificationToken: string | undefined,
  pushContent: PushNotificationsContentTypeEnum | undefined,
  pushReminder: ReminderStatusEnum | undefined
): GlobalState =>
  ({
    authentication: {
      kind: "LoggedOutWithoutIdp",
      reason: "NOT_LOGGED_IN"
    },
    features: {
      loginFeatures: {
        fastLogin: {
          optIn: {
            enabled: true
          }
        }
      },
      payments: {
        wallet: {
          userMethods: pot.none
        }
      },
      services: {
        details: {
          preferencesById: {
            [pnServiceId]: pot.some({
              kind: "success",
              value: {
                inbox: true
              }
            })
          }
        }
      } as unknown as ServicesState,
      wallet: {
        cards: {},
        placeholders: {
          items: {}
        }
      }
    },
    notifications: {
      installation: {
        token: notificationToken
      }
    },
    persistedPreferences: {
      fontPreference: "comfortable",
      isMixpanelEnabled: true
    },
    profile: pot.some({
      accepted_tos_version: 1,
      push_notifications_content_type: pushContent,
      reminder_status: pushReminder,
      service_preferences_settings: {
        mode: "AUTO"
      }
    }),
    remoteConfig: O.some({
      pn: {
        notificationServiceId: pnServiceId
      }
    })
  } as GlobalState);
