import * as O from "fp-ts/lib/Option";
import { MixpanelProperties } from "mixpanel-react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../store/reducers/types";
import * as BIOMETRICS from "../../utils/biometrics";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import * as PUSHUTILS from "../../features/pushNotifications/utils";
import { StoredCredential } from "../../features/itwallet/common/utils/itwTypesUtils";
import { updateMixpanelSuperProperties } from "../superProperties";
import * as APPVERSION from "../../utils/appVersion";
import * as DEVICE from "../../utils/device";
import * as ACCESSIBILITY from "../../utils/accessibility";

jest.mock("react-native-i18n", () => ({
  t: (key: string) => key
}));

const mockColorScheme = "light";
jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  Appearance: {
    getColorScheme: jest.fn(() => mockColorScheme)
  }
}));

// eslint-disable-next-line functional/no-let
let mockIsMixpanelInitialized = true;
const mockedRegisterSuperProperties = jest.fn();
jest.mock("../../mixpanel", () => ({
  isMixpanelInstanceInitialized: () => mockIsMixpanelInitialized,
  registerSuperProperties: (properties: MixpanelProperties) =>
    mockedRegisterSuperProperties(properties)
}));

describe("superProperties", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  describe("updateMixpanelSuperProperties", () => {
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
      ].forEach(notificationPermissionTuple => {
        mockIsMixpanelInitialized = true;
        it(`should call 'mixpanel.getPeople().set' with proper parameter's value for input
({
    notificationPermission: ${notificationPermissionTuple[0]}
    push_notifications_content_type: ${pushContentReminderTuple[0]},
    reminder_status: ${pushContentReminderTuple[1]},
})
`, async () => {
          const state = generateMockedGlobalState(
            pushContentReminderTuple[0] as PushNotificationsContentTypeEnum,
            pushContentReminderTuple[1] as ReminderStatusEnum
          );
          jest
            .spyOn(APPVERSION, "getAppVersion")
            .mockImplementation(() => "1.0.0.0");
          jest
            .spyOn(BIOMETRICS, "getBiometricsType")
            .mockImplementation(() => Promise.resolve("FACE_ID"));
          jest
            .spyOn(PUSHUTILS, "checkNotificationPermissions")
            .mockImplementation(() =>
              Promise.resolve(notificationPermissionTuple[0] as boolean)
            );
          jest
            .spyOn(DEVICE, "getFontScale")
            .mockImplementation(() => Promise.resolve(2.0));
          jest
            .spyOn(DEVICE, "isScreenLockSet")
            .mockImplementation(() => Promise.resolve(true));
          jest
            .spyOn(ACCESSIBILITY, "isScreenReaderEnabled")
            .mockImplementation(() => Promise.resolve(true));

          await updateMixpanelSuperProperties(state);

          expect(mockedRegisterSuperProperties.mock.calls.length).toBe(1);
          expect(mockedRegisterSuperProperties.mock.calls[0].length).toBe(1);
          expect(mockedRegisterSuperProperties.mock.calls[0][0]).toEqual({
            appReadableVersion: "1.0.0.0",
            biometricTechnology: "FACE_ID",
            colorScheme: mockColorScheme,
            fontScale: 2.0,
            isScreenLockSet: true,
            isScreenReaderEnabled: true,
            CGN_STATUS: "not_active",
            ITW_CED_V2: "not_available",
            ITW_ID_V2: "not_available",
            ITW_PG_V2: "not_available",
            ITW_STATUS_V2: "L2",
            ITW_TS_V2: "not_available",
            LOGIN_SESSION: "365",
            NOTIFICATION_CONFIGURATION: pushContentReminderTuple[2],
            NOTIFICATION_PERMISSION: notificationPermissionTuple[1],
            SAVED_PAYMENT_METHOD: 0,
            SERVICE_CONFIGURATION: "AUTO",
            WELFARE_STATUS: []
          });
        });
      })
    );
  });
  it("should do nothing if 'isMixpanelInstanceInitialized' returns 'false'", async () => {
    mockIsMixpanelInitialized = false;
    const state = {} as GlobalState;

    await updateMixpanelSuperProperties(state);

    expect(mockedRegisterSuperProperties.mock.calls.length).toBe(0);
  });
});

const generateMockedGlobalState = (
  pushContent: PushNotificationsContentTypeEnum | undefined,
  pushReminder: ReminderStatusEnum | undefined
): GlobalState =>
  ({
    authentication: {
      kind: "LoggedOutWithoutIdp",
      reason: "NOT_LOGGED_IN"
    },
    features: {
      itWallet: {
        credentials: {
          eid: O.none,
          credentials: [] as Array<O.Option<StoredCredential>>
        },
        preferences: {
          authLevel: "L2"
        }
      },
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
      wallet: {
        cards: {},
        placeholders: {
          items: {}
        }
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
    })
  } as GlobalState);
