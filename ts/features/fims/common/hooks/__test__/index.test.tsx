import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ComponentType } from "react";
import { createStore } from "redux";
import {
  FIMSServiceData,
  testable,
  useAutoFetchingServiceByIdPot,
  useFIMSAuthenticationFlow,
  useFIMSFromServiceId,
  useFIMSRemoteServiceConfiguration
} from "..";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { GlobalState } from "../../../../../store/reducers/types";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import { FIMS_ROUTES } from "../../navigation";
import { FimsServiceConfiguration } from "../../../../../../definitions/content/FimsServiceConfiguration";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

const mockNavigate = jest.fn();
const mockNavigation = {
  getState: () => ({
    index: 0,
    routes: [
      {
        name: "MESSAGE_DETAIL"
      }
    ]
  }),
  navigate: mockNavigate
} as unknown as IOStackNavigationProp<AppParamsList, keyof AppParamsList>;
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => mockNavigation
  };
});

// eslint-disable-next-line functional/no-let
let serviceDataPot: pot.Pot<ServiceDetails, Error> | undefined;
// eslint-disable-next-line functional/no-let
let serviceData: FIMSServiceData | undefined;
// eslint-disable-next-line functional/no-let
let authenticationCallback: ((label: string, url: string) => void) | undefined;
// eslint-disable-next-line functional/no-let
let authenticationCallbackWithServiceId:
  | ((label: string, serviceId: ServiceId, url: string) => void)
  | undefined;

describe("index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    serviceDataPot = undefined;
    serviceData = undefined;
    authenticationCallback = undefined;
    authenticationCallbackWithServiceId = undefined;
  });
  describe("useAutoFetchingServiceByIdPot", () => {
    const service = {} as ServiceDetails;
    [
      pot.none,
      pot.noneLoading,
      pot.noneUpdating(service),
      pot.noneError(Error("")),
      pot.some(service),
      pot.someLoading(service),
      pot.someUpdating(service, service),
      pot.someError(service, Error(""))
    ].forEach(servicePot => {
      const shouldHaveCalledDispatch =
        servicePot.kind === "PotNone" || servicePot.kind === "PotNoneError";
      it(`should ${
        shouldHaveCalledDispatch ? "" : "not "
      }have dispatched 'loadServiceDetail.request' and returned proper data for input pot of type '${
        servicePot.kind
      }'`, () => {
        const serviceId = "01JMESJKA9HS28MEW12P7WPYVC" as ServiceId;

        renderAutoFetchHook(serviceId, servicePot, serviceId);

        expect(serviceDataPot).toEqual(servicePot);
        if (shouldHaveCalledDispatch) {
          expect(mockDispatch.mock.calls.length).toBe(1);
          expect(mockDispatch.mock.calls[0].length).toBe(1);
          expect(mockDispatch.mock.calls[0][0]).toEqual(
            loadServiceDetail.request(serviceId)
          );
        } else {
          expect(mockDispatch.mock.calls.length).toBe(0);
        }
      });
    });
    it(`should have dispatched 'loadServiceDetail.request' and returned proper data for unmatching serviceId`, () => {
      const hookServiceId = "01JMESJKA9HS28MEW12P7WPYVC" as ServiceId;

      renderAutoFetchHook(
        hookServiceId,
        pot.some({} as ServiceDetails),
        "8MEW12P7WPYVC01JMESJKA9HS2" as ServiceId
      );

      expect(serviceDataPot).toEqual(pot.none);

      expect(mockDispatch.mock.calls.length).toBe(1);
      expect(mockDispatch.mock.calls[0].length).toBe(1);
      expect(mockDispatch.mock.calls[0][0]).toEqual(
        loadServiceDetail.request(hookServiceId)
      );
    });
  });
  describe("useFIMSFromServiceId", () => {
    const serviceId = "01JMEWNY9BC3KVRCGTY1737J0S" as ServiceId;
    const service = {
      id: serviceId,
      name: "A service name",
      organization: {
        fiscal_code: "01234567891",
        name: "An organization name"
      }
    } as ServiceDetails;
    [
      pot.none,
      pot.noneLoading,
      pot.noneUpdating(service),
      pot.noneError(Error("")),
      pot.some(service),
      pot.someLoading(service),
      pot.someUpdating(service, service),
      pot.someError(service, Error(""))
    ].forEach(servicePot => {
      it(`should call 'navigation.navigate' with proper parameters for '${servicePot.kind}' service and return proper service data for analytics`, () => {
        const expectedServiceData = pot.isSome(servicePot)
          ? {
              serviceId,
              organizationFiscalCode: service.organization.fiscal_code,
              organizationName: service.organization.name,
              serviceName: service.name,
              ephemeralSessionOniOS: false
            }
          : {
              serviceId,
              ephemeralSessionOniOS: false
            };

        renderFromServiceIdHook(serviceId, servicePot, serviceId);

        expect(serviceData).toEqual(expectedServiceData);
        expect(authenticationCallback).toBeDefined();

        const label = "A label";
        const url = "iosso://https://relyingParty.url/login";
        authenticationCallback!(label, url);

        expect(mockNavigate.mock.calls.length).toBe(1);
        expect(mockNavigate.mock.calls[0].length).toBe(2);
        expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
        expect(mockNavigate.mock.calls[0][1]).toEqual({
          screen: FIMS_ROUTES.CONSENTS,
          params: {
            ctaUrl: "https://relyingParty.url/login",
            ctaText: label,
            organizationFiscalCode: pot.isSome(servicePot)
              ? service.organization.fiscal_code
              : undefined,
            organizationName: pot.isSome(servicePot)
              ? service.organization.name
              : undefined,
            serviceId: service.id,
            serviceName: pot.isSome(servicePot) ? service.name : undefined,
            source: MESSAGES_ROUTES.MESSAGE_DETAIL,
            ephemeralSessionOniOS: false
          }
        });
      });
    });
    it(`should call 'navigation.navigate' with proper parameters for unmatching service id and return proper service data for analytics`, () => {
      const hookServiceId = "01JMEZB6QNR7KKDEFRR6WZEH6F" as ServiceId;
      const expectedServiceData = {
        serviceId: hookServiceId,
        ephemeralSessionOniOS: false
      };

      renderFromServiceIdHook(hookServiceId, pot.some(service), serviceId);

      expect(serviceData).toEqual(expectedServiceData);
      expect(authenticationCallback).toBeDefined();

      const label = "A label";
      const url = "iosso://https://relyingParty.url/login";
      authenticationCallback!(label, url);

      expect(mockNavigate.mock.calls.length).toBe(1);
      expect(mockNavigate.mock.calls[0].length).toBe(2);
      expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
      expect(mockNavigate.mock.calls[0][1]).toEqual({
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaUrl: "https://relyingParty.url/login",
          ctaText: label,
          organizationFiscalCode: undefined,
          organizationName: undefined,
          serviceId: hookServiceId,
          serviceName: undefined,
          source: MESSAGES_ROUTES.MESSAGE_DETAIL,
          ephemeralSessionOniOS: false
        }
      });
    });
  });
  describe("useFIMSAuthenticationFlow", () => {
    const serviceId = "01JMEWNY9BC3KVRCGTY1737J0S" as ServiceId;
    const service = {
      id: serviceId,
      name: "A service name",
      organization: {
        fiscal_code: "01234567891",
        name: "An organization name"
      }
    } as ServiceDetails;
    [
      pot.none,
      pot.noneLoading,
      pot.noneUpdating(service),
      pot.noneError(Error("")),
      pot.some(service),
      pot.someLoading(service),
      pot.someUpdating(service, service),
      pot.someError(service, Error(""))
    ].forEach(servicePot => {
      it(`should call 'navigation.navigate' with proper parameters for '${servicePot.kind}' service and return proper service data for analytics`, () => {
        renderFromAuthenticationFlowHook(servicePot, serviceId);

        expect(authenticationCallbackWithServiceId).toBeDefined();

        const label = "A label";
        const url = "iosso://https://relyingParty.url/login";
        authenticationCallbackWithServiceId!(label, serviceId, url);

        expect(mockNavigate.mock.calls.length).toBe(1);
        expect(mockNavigate.mock.calls[0].length).toBe(2);
        expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
        expect(mockNavigate.mock.calls[0][1]).toEqual({
          screen: FIMS_ROUTES.CONSENTS,
          params: {
            ctaUrl: "https://relyingParty.url/login",
            ctaText: label,
            organizationFiscalCode: pot.isSome(servicePot)
              ? service.organization.fiscal_code
              : undefined,
            organizationName: pot.isSome(servicePot)
              ? service.organization.name
              : undefined,
            serviceId: service.id,
            serviceName: pot.isSome(servicePot) ? service.name : undefined,
            source: MESSAGES_ROUTES.MESSAGE_DETAIL,
            ephemeralSessionOniOS: false
          }
        });
      });
    });
    it(`should call 'navigation.navigate' with proper parameters for unmatching service id and return proper service data for analytics`, () => {
      const hookServiceId = "01JMEZB6QNR7KKDEFRR6WZEH6F" as ServiceId;

      renderFromAuthenticationFlowHook(pot.some(service), serviceId);

      expect(authenticationCallbackWithServiceId).toBeDefined();

      const label = "A label";
      const url = "iosso://https://relyingParty.url/login";
      authenticationCallbackWithServiceId!(label, hookServiceId, url);

      expect(mockNavigate.mock.calls.length).toBe(1);
      expect(mockNavigate.mock.calls[0].length).toBe(2);
      expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
      expect(mockNavigate.mock.calls[0][1]).toEqual({
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaUrl: "https://relyingParty.url/login",
          ctaText: label,
          organizationFiscalCode: undefined,
          organizationName: undefined,
          serviceId: hookServiceId,
          serviceName: undefined,
          source: MESSAGES_ROUTES.MESSAGE_DETAIL,
          ephemeralSessionOniOS: false
        }
      });
    });
  });
  describe("useFIMSRemoteServiceConfiguration", () => {
    it(`should call 'navigation.navigate' with proper parameters and return proper service data for analytics`, () => {
      const configurationId = "configId";
      const configuration: FimsServiceConfiguration = {
        configuration_id: configurationId,
        organization_fiscal_code: "01234567890",
        organization_name: "Organization name",
        service_id: "01JMF90E33B89232YER1WRYQ26" as ServiceId,
        service_name: "Service name"
      };

      renderFromRemoteConfigurationHook(configuration, configurationId);

      expect(serviceData).toEqual({
        serviceId: configuration.service_id,
        organizationFiscalCode: configuration.organization_fiscal_code,
        organizationName: configuration.organization_name,
        serviceName: configuration.service_name,
        ephemeralSessionOniOS: false
      });
      expect(authenticationCallback).toBeDefined();

      const label = "FIMS label";
      const url = "iosso://https://relyingParty.url/login";
      authenticationCallback!(label, url);

      expect(mockNavigate.mock.calls.length).toBe(1);
      expect(mockNavigate.mock.calls[0].length).toBe(2);
      expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
      expect(mockNavigate.mock.calls[0][1]).toEqual({
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaUrl: "https://relyingParty.url/login",
          ctaText: label,
          organizationFiscalCode: configuration.organization_fiscal_code,
          organizationName: configuration.organization_name,
          serviceId: configuration.service_id,
          serviceName: configuration.service_name,
          source: MESSAGES_ROUTES.MESSAGE_DETAIL,
          ephemeralSessionOniOS: false
        }
      });
    });
    it(`should not call 'navigation.navigate' and return undefined serviceData when configuration id does not match`, () => {
      const configuration: FimsServiceConfiguration = {
        configuration_id: "configId",
        organization_fiscal_code: "01234567890",
        organization_name: "Organization name",
        service_id: "01JMF90E33B89232YER1WRYQ26" as ServiceId,
        service_name: "Service name"
      };

      renderFromRemoteConfigurationHook(
        configuration,
        "unmatchingConfiguration"
      );

      expect(serviceData).toBeUndefined();
      expect(authenticationCallback).toBeDefined();

      const label = "FIMS label";
      const url = "iosso://https://relyingParty.url/login";
      authenticationCallback!(label, url);

      expect(mockNavigate.mock.calls.length).toBe(0);
    });
  });
  describe("navigateToFIMSAuthorizationFlow", () => {
    it("should call 'navigation.navigate' with proper parameters", () => {
      const label = "A label";
      const innerServiceData = {
        organizationFiscalCode: "01234567891",
        organizationName: "Organization name",
        serviceId: "01JMFDP73MT43B4507XXQB0105" as ServiceId,
        serviceName: "Service name",
        ephemeralSessionOniOS: true
      };
      const url = "iosso://https://relyingParty.url/login";

      testable!.navigateToFIMSAuthorizationFlow(
        label,
        mockNavigation,
        innerServiceData,
        url
      );

      expect(mockNavigate.mock.calls.length).toBe(1);
      expect(mockNavigate.mock.calls[0].length).toBe(2);
      expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
      expect(mockNavigate.mock.calls[0][1]).toEqual({
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaUrl: "https://relyingParty.url/login",
          ctaText: label,
          organizationFiscalCode: innerServiceData.organizationFiscalCode,
          organizationName: innerServiceData.organizationName,
          serviceId: innerServiceData.serviceId,
          serviceName: innerServiceData.serviceName,
          source: MESSAGES_ROUTES.MESSAGE_DETAIL,
          ephemeralSessionOniOS: true
        }
      });
    });
  });
  describe("serviceDataFromConfigurationId", () => {
    it(`should return service data when the configuration id matches`, () => {
      const configuration: FimsServiceConfiguration = {
        configuration_id: "configId",
        organization_fiscal_code: "01234567890",
        organization_name: "Organization name",
        service_id: "01JMF90E33B89232YER1WRYQ26" as ServiceId,
        service_name: "Service name"
      };
      const appState = {
        remoteConfig: O.some({
          fims: {
            services: [configuration]
          }
        })
      } as GlobalState;

      const serviceConfiguration = testable!.serviceDataFromConfigurationId(
        configuration.configuration_id,
        appState
      );
      expect(serviceConfiguration).toEqual({
        organizationFiscalCode: configuration.organization_fiscal_code,
        organizationName: configuration.organization_name,
        serviceId: configuration.service_id,
        serviceName: configuration.service_name,
        ephemeralSessionOniOS: false
      });
    });
    it(`should return 'undefined' when the configuration id does not match`, () => {
      const configuration: FimsServiceConfiguration = {
        configuration_id: "configId",
        organization_fiscal_code: "01234567890",
        organization_name: "Organization name",
        service_id: "01JMF90E33B89232YER1WRYQ26" as ServiceId,
        service_name: "Service name"
      };
      const appState = {
        remoteConfig: O.some({
          fims: {
            services: [configuration]
          }
        })
      } as GlobalState;

      const serviceConfiguration = testable!.serviceDataFromConfigurationId(
        "unmatchingConfigurationId",
        appState
      );
      expect(serviceConfiguration).toBeUndefined();
    });
  });
  describe("serviceDataFromServiceId", () => {
    const serviceId = "01JMFEZR305XG9VSAB9RYX6X6B" as ServiceId;
    const service = {
      id: serviceId,
      name: "Service name",
      organization: {
        fiscal_code: "01234567890",
        name: "Organization name"
      }
    } as ServiceDetails;
    [
      pot.none,
      pot.noneLoading,
      pot.noneUpdating(service),
      pot.noneError(Error("")),
      pot.some(service),
      pot.someLoading(service),
      pot.someUpdating(service, service),
      pot.someError(service, Error(""))
    ].forEach(servicePot => {
      it(`should return proper service data for matching service id and service data of type ${servicePot.kind}`, () => {
        const state = {
          appState: { appState: "active" },
          navigation: {},
          authentication: {},
          features: {
            services: {
              details: {
                dataById: {
                  [serviceId]: servicePot
                }
              }
            },
            fims: {
              sso: {
                ephemeralSessionOniOS: false
              }
            }
          },
          remoteConfig: O.some({
            fims: {
              iOSCookieDisabledServiceIds: []
            }
          })
        } as unknown as GlobalState;

        const internalServiceData = testable!.serviceDataFromServiceId(
          serviceId,
          state
        );

        expect(internalServiceData).toEqual(
          pot.isSome(servicePot)
            ? {
                organizationFiscalCode: service.organization.fiscal_code,
                organizationName: service.organization.name,
                serviceId: service.id,
                serviceName: service.name,
                ephemeralSessionOniOS: false
              }
            : {
                serviceId: service.id,
                ephemeralSessionOniOS: false
              }
        );
      });
    });
    it(`should return proper service data for unmatching service id`, () => {
      const callbackServiceId = "01JMFFSRBHTN09A6CFM0MTXFP6" as ServiceId;
      const state = {
        appState: { appState: "active" },
        navigation: {},
        authentication: {},
        features: {
          services: {
            details: {
              dataById: {
                [serviceId]: pot.some(service)
              }
            },
            fims: {
              sso: {
                ephemeralSessionOniOS: false
              }
            }
          }
        },
        remoteConfig: O.some({
          cgn: {
            enabled: false
          },
          fims: {
            services: [],
            iOSCookieDisabledServiceIds: []
          },
          itw: {
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          }
        })
      } as unknown as GlobalState;

      const internalServiceData = testable!.serviceDataFromServiceId(
        callbackServiceId,
        state
      );

      expect(internalServiceData).toEqual({
        serviceId: callbackServiceId,
        ephemeralSessionOniOS: false
      });
    });
  });
  describe("useFIMSFromServiceData", () => {
    it(`should return authentication callback that calls navigation.navigate with proper parameters when input data is defined`, () => {
      const internalServiceData = {
        organizationFiscalCode: "01234567891",
        organizationName: "Organization name",
        serviceId: "01JMFG3E20JFQH6HAQD9BDRB19" as ServiceId,
        serviceName: "Service name",
        ephemeralSessionOniOS: true
      };

      renderFromServiceDataHook(internalServiceData);

      expect(authenticationCallback).toBeDefined();

      const label = "A label";
      const url = "iosso://https://relyingParty.url/login";
      authenticationCallback!(label, url);
      expect(mockNavigate.mock.calls.length).toBe(1);
      expect(mockNavigate.mock.calls[0].length).toBe(2);
      expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
      expect(mockNavigate.mock.calls[0][1]).toEqual({
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaUrl: "https://relyingParty.url/login",
          ctaText: label,
          organizationFiscalCode: internalServiceData.organizationFiscalCode,
          organizationName: internalServiceData.organizationName,
          serviceId: internalServiceData.serviceId,
          serviceName: internalServiceData.serviceName,
          source: MESSAGES_ROUTES.MESSAGE_DETAIL,
          ephemeralSessionOniOS: true
        }
      });
    });
    it(`should return authentication callback that does nothing when input data is undefined`, () => {
      renderFromServiceDataHook(undefined);

      expect(authenticationCallback).toBeDefined();

      authenticationCallback!(
        "a label",
        "iosso://https://relyingParty.url/login"
      );
      expect(mockNavigate.mock.calls.length).toBe(0);
    });
  });
});

const renderAutoFetchHook = (
  hookServiceId: ServiceId,
  servicePot: pot.Pot<ServiceDetails, Error>,
  storeServiceId: ServiceId
) => {
  const appState = {
    features: {
      services: {
        details: {
          dataById: {
            [storeServiceId]: servicePot
          }
        }
      }
    }
  } as GlobalState;
  return genericRender(() => AutoFetchHookWrapper(hookServiceId), appState);
};

const renderFromServiceIdHook = (
  hookServiceId: ServiceId,
  servicePot: pot.Pot<ServiceDetails, Error>,
  storeServiceId: ServiceId
) => {
  const appState = {
    features: {
      services: {
        details: {
          dataById: {
            [storeServiceId]: servicePot
          }
        }
      },
      fims: {
        sso: {
          ephemeralSessionOniOS: true
        }
      }
    }
  } as GlobalState;
  return genericRender(() => FromServiceIdHookWrapper(hookServiceId), appState);
};

const renderFromAuthenticationFlowHook = (
  servicePot: pot.Pot<ServiceDetails, Error>,
  storeServiceId: ServiceId
) => {
  const appState = {
    features: {
      services: {
        details: {
          dataById: {
            [storeServiceId]: servicePot
          }
        }
      },
      fims: {
        sso: {
          ephemeralSessionOniOS: true
        }
      }
    }
  } as GlobalState;
  return genericRender(() => AuthenticationFlowHookWrapper(), appState);
};

const renderFromRemoteConfigurationHook = (
  configuration: FimsServiceConfiguration,
  hookConfigurationId: string
) => {
  const appState = {
    remoteConfig: O.some({
      cgn: {
        enabled: false
      },
      fims: {
        services: [configuration]
      },
      itw: {
        min_app_version: {
          android: "0.0.0.0",
          ios: "0.0.0.0"
        }
      }
    }),
    features: {
      fims: {
        sso: {
          ephemeralSessionOniOS: true
        }
      }
    }
  } as GlobalState;
  return genericRender(
    () => FromRemoteConfigurationHookWrapper(hookConfigurationId),
    appState
  );
};

const renderFromServiceDataHook = (
  internalServiceData: FIMSServiceData | undefined
) => {
  const appState = {
    features: {
      fims: {
        sso: {
          ephemeralSessionOniOS: true
        }
      }
    }
  } as GlobalState;
  return genericRender(
    () => FromServiceDataHookWrapper(internalServiceData),
    appState
  );
};

const AutoFetchHookWrapper = (serviceId: ServiceId) => {
  serviceDataPot = useAutoFetchingServiceByIdPot(serviceId);
  return undefined;
};
const FromServiceIdHookWrapper = (serviceId: ServiceId) => {
  const hookData = useFIMSFromServiceId(serviceId);
  serviceData = hookData.serviceData;
  authenticationCallback = hookData.startFIMSAuthenticationFlow;
  return undefined;
};
const AuthenticationFlowHookWrapper = () => {
  authenticationCallbackWithServiceId = useFIMSAuthenticationFlow();
  return undefined;
};
const FromRemoteConfigurationHookWrapper = (configurationId: string) => {
  const hookData = useFIMSRemoteServiceConfiguration(configurationId);
  serviceData = hookData.serviceData;
  authenticationCallback = hookData.startFIMSAuthenticationFlow;
  return undefined;
};
const FromServiceDataHookWrapper = (
  internalServiceData: FIMSServiceData | undefined
) => {
  authenticationCallback =
    testable!.useFIMSFromServiceData(internalServiceData);
  return undefined;
};

const genericRender = (
  hookWrapper: ComponentType<any>,
  appState: GlobalState
) => {
  const initialState = appReducer(appState, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    hookWrapper,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
