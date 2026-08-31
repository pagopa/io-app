import { PushNotificationsContentTypeEnum } from "@io-app/api-types/generated/definitions/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "@io-app/api-types/generated/definitions/identity/ReminderStatus";
import { ServicesPreferencesModeEnum } from "@io-app/api-types/generated/definitions/identity/ServicesPreferencesMode";
import { SpidLevelEnum } from "@io-app/api-types/generated/definitions/session_manager/SpidLevel";
import * as pot from "@pagopa/ts-commons/lib/pot";

import mockedProfile from "../../__mocks__/initializedProfile";
import { NotificationPreferenceConfiguration } from "../../features/settings/common/analytics";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { GlobalState } from "../../store/reducers/types";
import { SpidIdp } from "../../utils/idps";
import {
  authSecurityLevelHandler,
  cgnStatusHandler,
  loginMethodHandler,
  loginSessionConfigHandler,
  mixpanelOptInHandler,
  notificationConfigurationHandler,
  paymentMethodsHandler,
  serviceConfigHandler,
  welfareStatusHandler
} from "../mixpanelPropertyUtils";

describe("mixpanelPropertyUtils", () => {
  const state = appReducer(undefined, applicationChangeState("active"));

  const mockIdp: SpidIdp = {
    id: "poste",
    name: "Poste ID",
    logo: { light: { uri: "" } },
    profileUrl: "",
    isTestIdp: false
  };

  it("loginSessionConfigHandler should return 'not set' when optInState is undefined", () => {
    const mockState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        loginFeatures: {
          ...state.features.loginFeatures,
          fastLogin: {
            ...state.features.loginFeatures.fastLogin,
            optIn: {
              ...state.features.loginFeatures.fastLogin.optIn,
              enabled: undefined
            }
          }
        }
      }
    };
    expect(loginSessionConfigHandler(mockState)).toBe("not set");
  });

  it("loginSessionConfigHandler should return '365' when optInState is true", () => {
    const mockState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        loginFeatures: {
          ...state.features.loginFeatures,
          fastLogin: {
            ...state.features.loginFeatures.fastLogin,
            optIn: {
              ...state.features.loginFeatures.fastLogin.optIn,
              enabled: true
            }
          }
        }
      }
    };
    expect(loginSessionConfigHandler(mockState)).toBe("365");
  });

  it("loginSessionConfigHandler should return '30' when optInState is false", () => {
    const mockState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        loginFeatures: {
          ...state.features.loginFeatures,
          fastLogin: {
            ...state.features.loginFeatures.fastLogin,
            optIn: {
              ...state.features.loginFeatures.fastLogin.optIn,
              enabled: false
            }
          }
        }
      }
    };
    expect(loginSessionConfigHandler(mockState)).toBe("30");
  });

  it("notificationConfigurationHandler should return correct configuration", () => {
    const mockState: GlobalState = {
      ...state,
      profile: pot.some({
        ...mockedProfile,
        reminder_status: ReminderStatusEnum.ENABLED,
        push_notifications_content_type:
          PushNotificationsContentTypeEnum.ANONYMOUS
      })
    };
    const expectedConfig: NotificationPreferenceConfiguration = "reminder";
    expect(notificationConfigurationHandler(mockState)).toEqual(expectedConfig);
  });

  it("serviceConfigHandler should return 'not set' when serviceConfigState is LEGACY", () => {
    const mockState: GlobalState = {
      ...state,
      profile: pot.some({
        ...mockedProfile,
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.LEGACY
        }
      })
    };
    expect(serviceConfigHandler(mockState)).toBe("not set");
  });

  it("serviceConfigHandler should return correct configuration when serviceConfigState is set", () => {
    const mockStateAuto: GlobalState = {
      ...state,
      profile: pot.some({
        ...mockedProfile,
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.AUTO
        }
      })
    };

    const mockStateManual: GlobalState = {
      ...state,
      profile: pot.some({
        ...mockedProfile,
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.MANUAL
        }
      })
    };
    expect(serviceConfigHandler(mockStateAuto)).toBe(
      ServicesPreferencesModeEnum.AUTO
    );

    expect(serviceConfigHandler(mockStateManual)).toBe(
      ServicesPreferencesModeEnum.MANUAL
    );
  });

  it("mixpanelOptInHandler should return 'declined' when isMixpanelEnabled is undefined", () => {
    const mockState: GlobalState = {
      ...state,
      persistedPreferences: {
        ...state.persistedPreferences,
        isMixpanelEnabled: null
      }
    };
    expect(mixpanelOptInHandler(mockState)).toBe("declined");
  });

  it("mixpanelOptInHandler should return 'accepted' when isMixpanelEnabled is true", () => {
    const mockState: GlobalState = {
      ...state,
      persistedPreferences: {
        ...state.persistedPreferences,
        isMixpanelEnabled: true
      }
    };
    expect(mixpanelOptInHandler(mockState)).toBe("accepted");
  });

  it("mixpanelOptInHandler should return 'declined' when isMixpanelEnabled is false", () => {
    const mockState: GlobalState = {
      ...state,
      persistedPreferences: {
        ...state.persistedPreferences,
        isMixpanelEnabled: false
      }
    };
    expect(mixpanelOptInHandler(mockState)).toBe("declined");
  });

  it("paymentMethodsHandler should return the number of payment methods", () => {
    const mockState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        wallet: {
          ...state.features.wallet,
          placeholders: {
            ...state.features.wallet.placeholders,
            items: {
              "1": "payment",
              "2": "payment"
            }
          }
        }
      }
    };
    expect(paymentMethodsHandler(mockState)).toBe(2);
  });

  it("cgnStatusHandler should return 'active' when there are CGN cards", () => {
    const mockState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        wallet: {
          ...state.features.wallet,
          cards: {
            "1": {
              key: "12345",
              category: "cgn",
              type: "cgn"
            }
          }
        }
      }
    };
    expect(cgnStatusHandler(mockState)).toBe("active");
  });

  it("cgnStatusHandler should return 'not_active' when there are no CGN cards", () => {
    expect(cgnStatusHandler(state)).toBe("not_active");
  });

  it("welfareStatusHandler should return the names of idPay cards", () => {
    const mockState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        wallet: {
          ...state.features.wallet,
          cards: {
            "1": {
              amount: 0,
              avatarSource: {},
              expireDate: new Date(),
              initiativeId: "1",
              key: "12345",
              category: "bonus",
              type: "idPay",
              name: "Test idPay"
            }
          }
        }
      }
    };
    expect(welfareStatusHandler(mockState)).toEqual(["Test idPay"]);
  });

  it("authSecurityLevelHandler should return the spid level when the user is logged in with session info", () => {
    const mockState: GlobalState = {
      ...state,
      authentication: {
        ...state.authentication,
        kind: "LoggedInWithSessionInfo",
        idp: mockIdp,
        sessionToken: "abc",
        sessionInfo: {
          spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"]
        }
      }
    };
    expect(authSecurityLevelHandler(mockState)).toBe("L2");
  });

  it("authSecurityLevelHandler should return 'not set' when the user is not logged in", () => {
    expect(authSecurityLevelHandler(state)).toBe("not set");
  });

  it("loginMethodHandler should return the idp id when the user has an idp selected", () => {
    const mockState: GlobalState = {
      ...state,
      authentication: {
        ...state.authentication,
        kind: "LoggedInWithSessionInfo",
        idp: mockIdp,
        sessionToken: "abc",
        sessionInfo: {}
      }
    };
    expect(loginMethodHandler(mockState)).toBe("poste");
  });

  it("loginMethodHandler should return 'not set' when the user has no idp selected", () => {
    const mockState: GlobalState = {
      ...state,
      authentication: {
        ...state.authentication,
        kind: "LoggedOutWithoutIdp",
        reason: "NOT_LOGGED_IN"
      }
    };
    expect(loginMethodHandler(mockState)).toBe("not set");
  });
});
