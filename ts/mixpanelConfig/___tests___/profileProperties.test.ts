import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../store/reducers/types";
import { updateMixpanelProfileProperties } from "../profileProperties";
import * as BIOMETRICS from "../../utils/biometrics";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import * as PUSHUTILS from "../../features/pushNotifications/utils";
import { StoredCredential } from "../../features/itwallet/common/utils/itwTypesUtils";

const mockedSet = jest.fn();
jest.mock("../../mixpanel", () => ({
  get mixpanel() {
    return {
      getPeople: () => ({
        set: mockedSet
      })
    };
  }
}));

describe("profileProperties", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  describe("updateMixpanelProfileProperties", () => {
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
              BIOMETRIC_TECHNOLOGY: "FACE_ID",
              CGN_STATUS: "not_active",
              FONT_PREFERENCE: "comfortable",
              ITW_CED_V2: "not_available",
              ITW_ID_V2: "not_available",
              ITW_PG_V2: "not_available",
              ITW_STATUS_V2: "L2",
              ITW_TS_V2: "not_available",
              LOGIN_METHOD: "not set",
              LOGIN_SESSION: "365",
              NOTIFICATION_CONFIGURATION: pushContentReminderTuple[2],
              NOTIFICATION_PERMISSION: notificationPermissionTuple[1],
              NOTIFICATION_TOKEN: notificationTokenTuple[1],
              SAVED_PAYMENT_METHOD: 0,
              SERVICE_CONFIGURATION: "AUTO",
              TOS_ACCEPTED_VERSION: 1,
              TRACKING: "accepted",
              WELFARE_STATUS: []
            });
          })
        )
      )
    );
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
    })
  } as GlobalState);
