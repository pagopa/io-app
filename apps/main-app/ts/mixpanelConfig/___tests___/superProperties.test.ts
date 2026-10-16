import { PushNotificationsContentTypeEnum } from "@io-app/api-types/generated/definitions/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "@io-app/api-types/generated/definitions/identity/ReminderStatus";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { MixpanelProperties } from "mixpanel-react-native";
import { Appearance } from "react-native";

import * as LOGIN_CONFIG_SELECTORS from "../../features/authentication/common/store/selectors/loginConfig";
import * as PUSHUTILS from "../../features/pushNotifications/utils";
import { GlobalState } from "../../store/reducers/types";
import * as ACCESSIBILITY from "../../utils/accessibility";
import * as analytics from "../../utils/analytics";
import * as APPVERSION from "../../utils/appVersion";
import * as BIOMETRICS from "../../utils/biometrics";
import * as DEVICE from "../../utils/device";
import { SpidIdp } from "../../utils/idps";
import { updateMixpanelSuperProperties } from "../superProperties";

const mockColorScheme = "light";

// eslint-disable-next-line functional/no-let
let mockIsMixpanelInitialized: () => boolean = () => true;
const mockedRegisterSuperProperties = jest.fn();
jest.mock("../../mixpanel", () => ({
  isMixpanelInstanceInitialized: () => mockIsMixpanelInitialized(),
  registerSuperProperties: (properties: MixpanelProperties) =>
    mockedRegisterSuperProperties(properties)
}));

describe("superProperties", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock Appearance.getColorScheme using spyOn
    jest.spyOn(Appearance, "getColorScheme").mockReturnValue(mockColorScheme);
    jest
      .spyOn(LOGIN_CONFIG_SELECTORS, "isOneIdentityLoginEnabledSelector")
      .mockReturnValue(false);
  });

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
        mockIsMixpanelInitialized = () => true;
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
            CONNECTION_STATUS: "online",
            fontScale: 2.0,
            isScreenLockSet: true,
            isScreenReaderEnabled: true,
            AUTH_SECURITY_LEVEL: "not set",
            CGN_STATUS: "not_active",
            CDC_STATUS: 0,
            LOGIN_FLOW_IS_OI: false,
            LOGIN_METHOD: "not set",
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
  /* === === === === === === === === ===
   * AUTH_SECURITY_LEVEL / LOGIN_METHOD
   * === === === === === === === === === */
  const generateIdp = (id: string, name: string): SpidIdp => ({
    id,
    name,
    logo: { light: { uri: "" } },
    profileUrl: ""
  });
  const scenarios = [
    {
      name: "user is logged out",
      authenticationState: {
        kind: "LoggedOutWithoutIdp",
        reason: "NOT_LOGGED_IN"
      },
      expectedAuthSecurityLevel: "not set",
      expectedLoginMethod: "not set"
    },
    {
      name: "user is logged in with SPID L2",
      authenticationState: {
        kind: "LoggedInWithSessionInfo",
        idp: generateIdp("poste", "Poste ID"),
        sessionToken: "aSessionToken",
        sessionInfo: { spidLevel: "https://www.spid.gov.it/SpidL2" }
      },
      expectedAuthSecurityLevel: "L2",
      expectedLoginMethod: "poste"
    },
    {
      name: "user is logged in with CIE L3",
      authenticationState: {
        kind: "LoggedInWithSessionInfo",
        idp: generateIdp("cie", "CIE"),
        sessionToken: "aSessionToken",
        sessionInfo: { spidLevel: "https://www.spid.gov.it/SpidL3" }
      },
      expectedAuthSecurityLevel: "L3",
      expectedLoginMethod: "cie"
    }
  ];
  it.each(scenarios)(
    "should set AUTH_SECURITY_LEVEL to '$expectedAuthSecurityLevel' and LOGIN_METHOD to '$expectedLoginMethod' when $name",
    async ({
      authenticationState,
      expectedAuthSecurityLevel,
      expectedLoginMethod
    }) => {
      const state = {
        ...generateMockedGlobalState(undefined, undefined),
        authentication: authenticationState
      } as GlobalState;

      jest
        .spyOn(APPVERSION, "getAppVersion")
        .mockImplementation(() => "1.0.0.0");
      jest
        .spyOn(BIOMETRICS, "getBiometricsType")
        .mockImplementation(() => Promise.resolve("FACE_ID"));
      jest
        .spyOn(PUSHUTILS, "checkNotificationPermissions")
        .mockImplementation(() => Promise.resolve(false));
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

      expect(mockedRegisterSuperProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          AUTH_SECURITY_LEVEL: expectedAuthSecurityLevel,
          LOGIN_METHOD: expectedLoginMethod
        })
      );
    }
  );
  describe("LOGIN_FLOW_IS_OI", () => {
    const loggedOutAuthentication = {
      kind: "LoggedOutWithoutIdp",
      reason: "NOT_LOGGED_IN"
    };
    const loggedInAuthentication = {
      kind: "LoggedInWithSessionInfo",
      idp: {
        id: "poste",
        name: "Poste ID",
        logo: { light: { uri: "" } },
        profileUrl: ""
      },
      sessionToken: "aSessionToken",
      sessionInfo: { spidLevel: "https://www.spid.gov.it/SpidL2" }
    };

    beforeEach(() => {
      mockIsMixpanelInitialized = () => true;
      jest.spyOn(BIOMETRICS, "getBiometricsType").mockResolvedValue("FACE_ID");
      jest
        .spyOn(PUSHUTILS, "checkNotificationPermissions")
        .mockResolvedValue(false);
      jest.spyOn(DEVICE, "getFontScale").mockResolvedValue(1);
      jest.spyOn(DEVICE, "isScreenLockSet").mockResolvedValue(true);
      jest
        .spyOn(ACCESSIBILITY, "isScreenReaderEnabled")
        .mockResolvedValue(true);
    });

    const registerWith = async (
      authentication: Record<string, unknown>,
      isOneIdentityEnabled: boolean,
      isOneIdentityLogin: boolean | undefined = undefined
    ) => {
      jest
        .spyOn(LOGIN_CONFIG_SELECTORS, "isOneIdentityLoginEnabledSelector")
        .mockReturnValue(isOneIdentityEnabled);
      const baseState = generateMockedGlobalState(undefined, undefined);
      const state = {
        ...baseState,
        authentication,
        features: {
          ...baseState.features,
          loginFeatures: {
            ...baseState.features.loginFeatures,
            loginFlow: { isOneIdentityLogin }
          }
        }
      } as unknown as GlobalState;

      await updateMixpanelSuperProperties(state);

      expect(mockedRegisterSuperProperties).toHaveBeenCalledTimes(1);
      return mockedRegisterSuperProperties.mock.calls[0][0];
    };

    it.each([
      {
        name: "logged out with rollout on",
        authentication: loggedOutAuthentication,
        rollout: true,
        expected: true
      },
      {
        name: "logged out with rollout off",
        authentication: loggedOutAuthentication,
        rollout: false,
        expected: false
      },
      {
        name: "logged in without a stored login flow and rollout on",
        authentication: loggedInAuthentication,
        isOneIdentityLogin: undefined,
        rollout: true,
        expected: true
      },
      {
        name: "logged in without a stored login flow and rollout off",
        authentication: loggedInAuthentication,
        isOneIdentityLogin: undefined,
        rollout: false,
        expected: false
      },
      {
        name: "logged in with OneIdentity and rollout turned off",
        authentication: loggedInAuthentication,
        isOneIdentityLogin: true,
        rollout: false,
        expected: true
      },
      {
        name: "logged in with IO and rollout turned on",
        authentication: loggedInAuthentication,
        isOneIdentityLogin: false,
        rollout: true,
        expected: false
      }
    ])(
      "registers LOGIN_FLOW_IS_OI=$expected when $name",
      async ({ authentication, isOneIdentityLogin, rollout, expected }) => {
        const registered = await registerWith(
          authentication,
          rollout,
          isOneIdentityLogin
        );

        expect(registered).toHaveProperty("LOGIN_FLOW_IS_OI", expected);
      }
    );

    it("registers the forced value even while logged in", async () => {
      jest
        .spyOn(LOGIN_CONFIG_SELECTORS, "isOneIdentityLoginEnabledSelector")
        .mockReturnValue(false);
      const state = {
        ...generateMockedGlobalState(undefined, undefined),
        authentication: loggedInAuthentication
      } as unknown as GlobalState;

      await updateMixpanelSuperProperties(state, {
        property: "LOGIN_FLOW_IS_OI",
        value: true
      });

      expect(mockedRegisterSuperProperties).toHaveBeenCalledWith(
        expect.objectContaining({ LOGIN_FLOW_IS_OI: true })
      );
    });
  });
  it("should do nothing if 'isMixpanelInstanceInitialized' returns 'false'", async () => {
    mockIsMixpanelInitialized = () => false;
    const state = {} as GlobalState;

    await updateMixpanelSuperProperties(state);

    expect(mockedRegisterSuperProperties.mock.calls.length).toBe(0);
  });
  it("should call trackAppCaughtError with proper parameters when an exception is thrown", async () => {
    mockIsMixpanelInitialized = () => {
      throw new Error("mixpanel initialization check failed");
    };
    const trackAppCaughtErrorSpy = jest
      .spyOn(analytics, "trackAppCaughtError")
      .mockImplementation(() => undefined);
    const fakeState = {} as GlobalState;

    await updateMixpanelSuperProperties(fakeState);

    expect(trackAppCaughtErrorSpy).toHaveBeenCalledWith(
      "updateMixpanelSuperProperties",
      undefined,
      expect.stringContaining("mixpanel initialization check failed")
    );
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
      loginFeatures: {
        fastLogin: {
          optIn: {
            enabled: true
          }
        },
        loginFlow: {
          isOneIdentityLogin: undefined
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
      },
      connectivityStatus: {
        isConnected: true
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
  }) as GlobalState;
