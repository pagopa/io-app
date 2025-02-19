import * as pot from "@pagopa/ts-commons/lib/pot";
import { ComponentType } from "react";
import { createStore } from "redux";
import {
  useAutoFetchingServiceByIdPot,
  useFIMSAuthenticationFlow,
  useFIMSFromServiceId
} from "..";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { GlobalState } from "../../../../../store/reducers/types";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import { FIMS_ROUTES } from "../../navigation";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

const mockNavigation = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      getState: () => ({
        index: 0,
        routes: [
          {
            name: "MESSAGE_DETAIL"
          }
        ]
      }),
      navigate: mockNavigation
    })
  };
});

// eslint-disable-next-line functional/no-let
let serviceDataPot: pot.Pot<ServicePublic, Error> | undefined;
// eslint-disable-next-line functional/no-let
let serviceData: unknown;
// eslint-disable-next-line functional/no-let
let authenticationCallback: (label: string, url: string) => void | undefined;
// eslint-disable-next-line functional/no-let
let authenticationCallbackWithServiceId: (
  label: string,
  serviceId: ServiceId,
  url: string
) => void | undefined;

describe("index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("useAutoFetchingServiceByIdPot", () => {
    const service = {} as ServicePublic;
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
        pot.some({} as ServicePublic),
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
      organization_fiscal_code: "01234567891",
      organization_name: "An organization name",
      service_id: serviceId,
      service_name: "A service name"
    } as ServicePublic;
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
      it(`should call 'navigation.navigate' with proper paramters for '${servicePot.kind}' service and return proper service data for analytics`, () => {
        const expectedServiceData = pot.isSome(servicePot)
          ? {
              serviceId,
              organizationFiscalCode: service.organization_fiscal_code,
              organizationName: service.organization_name,
              serviceName: service.service_name
            }
          : {
              serviceId
            };

        renderFromServiceIdHook(serviceId, servicePot, serviceId);

        expect(serviceData).toEqual(expectedServiceData);
        expect(authenticationCallback).toBeDefined();

        const label = "A label";
        const url = "iosso://https://relyingParty.url/login";
        authenticationCallback(label, url);

        expect(mockNavigation.mock.calls.length).toBe(1);
        expect(mockNavigation.mock.calls[0].length).toBe(2);
        expect(mockNavigation.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
        expect(mockNavigation.mock.calls[0][1]).toEqual({
          screen: FIMS_ROUTES.CONSENTS,
          params: {
            ctaUrl: "https://relyingParty.url/login",
            ctaText: label,
            organizationFiscalCode: pot.isSome(servicePot)
              ? service.organization_fiscal_code
              : undefined,
            organizationName: pot.isSome(servicePot)
              ? service.organization_name
              : undefined,
            serviceId: service.service_id,
            serviceName: pot.isSome(servicePot)
              ? service.service_name
              : undefined,
            source: MESSAGES_ROUTES.MESSAGE_DETAIL
          }
        });
      });
    });
    it(`should call 'navigation.navigate' with proper paramters for unmatching service id and return proper service data for analytics`, () => {
      const hookServiceId = "01JMEZB6QNR7KKDEFRR6WZEH6F" as ServiceId;
      const expectedServiceData = {
        serviceId: hookServiceId
      };

      renderFromServiceIdHook(hookServiceId, pot.some(service), serviceId);

      expect(serviceData).toEqual(expectedServiceData);
      expect(authenticationCallback).toBeDefined();

      const label = "A label";
      const url = "iosso://https://relyingParty.url/login";
      authenticationCallback(label, url);

      expect(mockNavigation.mock.calls.length).toBe(1);
      expect(mockNavigation.mock.calls[0].length).toBe(2);
      expect(mockNavigation.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
      expect(mockNavigation.mock.calls[0][1]).toEqual({
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaUrl: "https://relyingParty.url/login",
          ctaText: label,
          organizationFiscalCode: undefined,
          organizationName: undefined,
          serviceId: hookServiceId,
          serviceName: undefined,
          source: MESSAGES_ROUTES.MESSAGE_DETAIL
        }
      });
    });
  });
  describe("useFIMSAuthenticationFlow", () => {
    const serviceId = "01JMEWNY9BC3KVRCGTY1737J0S" as ServiceId;
    const service = {
      organization_fiscal_code: "01234567891",
      organization_name: "An organization name",
      service_id: serviceId,
      service_name: "A service name"
    } as ServicePublic;
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
      it(`should call 'navigation.navigate' with proper paramters for '${servicePot.kind}' service and return proper service data for analytics`, () => {
        renderFromAuthenticationFlowHook(servicePot, serviceId);

        expect(authenticationCallbackWithServiceId).toBeDefined();

        const label = "A label";
        const url = "iosso://https://relyingParty.url/login";
        authenticationCallbackWithServiceId(label, serviceId, url);

        expect(mockNavigation.mock.calls.length).toBe(1);
        expect(mockNavigation.mock.calls[0].length).toBe(2);
        expect(mockNavigation.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
        expect(mockNavigation.mock.calls[0][1]).toEqual({
          screen: FIMS_ROUTES.CONSENTS,
          params: {
            ctaUrl: "https://relyingParty.url/login",
            ctaText: label,
            organizationFiscalCode: pot.isSome(servicePot)
              ? service.organization_fiscal_code
              : undefined,
            organizationName: pot.isSome(servicePot)
              ? service.organization_name
              : undefined,
            serviceId: service.service_id,
            serviceName: pot.isSome(servicePot)
              ? service.service_name
              : undefined,
            source: MESSAGES_ROUTES.MESSAGE_DETAIL
          }
        });
      });
    });
    it(`should call 'navigation.navigate' with proper paramters for unmatching service id and return proper service data for analytics`, () => {
      renderFromAuthenticationFlowHook(pot.some(service), serviceId);

      expect(authenticationCallbackWithServiceId).toBeDefined();

      const label = "A label";
      const callbackServiceId = "01JMEZB6QNR7KKDEFRR6WZEH6F" as ServiceId;
      const url = "iosso://https://relyingParty.url/login";
      authenticationCallbackWithServiceId(label, callbackServiceId, url);

      expect(mockNavigation.mock.calls.length).toBe(1);
      expect(mockNavigation.mock.calls[0].length).toBe(2);
      expect(mockNavigation.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
      expect(mockNavigation.mock.calls[0][1]).toEqual({
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaUrl: "https://relyingParty.url/login",
          ctaText: label,
          organizationFiscalCode: undefined,
          organizationName: undefined,
          serviceId: callbackServiceId,
          serviceName: undefined,
          source: MESSAGES_ROUTES.MESSAGE_DETAIL
        }
      });
    });
  });
});

const renderAutoFetchHook = (
  hookServiceId: ServiceId,
  servicePot: pot.Pot<ServicePublic, Error>,
  storeServiceId: ServiceId
) => {
  const appState = {
    features: {
      services: {
        details: {
          byId: {
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
  servicePot: pot.Pot<ServicePublic, Error>,
  storeServiceId: ServiceId
) => {
  const appState = {
    features: {
      services: {
        details: {
          byId: {
            [storeServiceId]: servicePot
          }
        }
      }
    }
  } as GlobalState;
  return genericRender(() => FromServiceIdHookWrapper(hookServiceId), appState);
};

const renderFromAuthenticationFlowHook = (
  servicePot: pot.Pot<ServicePublic, Error>,
  storeServiceId: ServiceId
) => {
  const appState = {
    features: {
      services: {
        details: {
          byId: {
            [storeServiceId]: servicePot
          }
        }
      }
    }
  } as GlobalState;
  return genericRender(() => AuthenticationFlowHookWrapper(), appState);
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
