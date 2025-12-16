import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { createStore } from "redux";
import { Body } from "@pagopa/io-app-design-system";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ServiceDetailsScreenPn } from "../ServiceDetailsScreenPn";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { applicationChangeState } from "../../../../../store/actions/application";
import { Config } from "../../../../../../definitions/content/Config";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../types/ServicePreferenceResponse";
import { getNetworkError, NetworkError } from "../../../../../utils/errors";

const backendStatus: BackendStatus = {
  ...baseRawBackendStatus
};

const serviceId = "servicePn" as ServiceId;

const service = {
  id: serviceId,
  name: "health",
  organization: {
    fiscal_code: "FSCLCD" as OrganizationFiscalCode,
    name: "Ċentru tas-Saħħa"
  }
} as ServiceDetails;

const servicePreferenceError: WithServiceID<NetworkError> = {
  id: serviceId,
  ...getNetworkError(new Error("GenericError"))
};

const servicePreferenceWihInboxEnabled: ServicePreferenceResponse = {
  id: serviceId as ServiceId,
  kind: "success",
  value: {
    inbox: true,
    push: true,
    email: false,
    can_access_message_read_status: false,
    settings_version: 0
  }
};

const servicePreferenceWihInboxDisabled: ServicePreferenceResponse = {
  id: serviceId as ServiceId,
  kind: "success",
  value: {
    inbox: false,
    push: true,
    email: false,
    can_access_message_read_status: false,
    settings_version: 0
  }
};

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("2.35.0.1"),
  getVersion: jest.fn().mockReturnValue("2.35.0.1"),
  isDisplayZoomed: jest.fn().mockReturnValue(false)
}));

describe("ServiceDetailsScreenPn", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot when service is not enabled", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      remoteConfig: O.some({
        ...backendStatus.config,
        pn: {
          ...backendStatus.config.pn,
          enabled: false
        }
      } as Config)
    } as GlobalState);

    const component = renderComponent(state);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when servicePreference could not be fetched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      features: {
        services: {
          details: {
            dataById: {
              [serviceId]: pot.some(service)
            },
            preferencesById: {
              [serviceId]: pot.noneError(servicePreferenceError)
            }
          }
        }
      },
      remoteConfig: O.some({
        ...backendStatus.config,
        pn: {
          ...backendStatus.config.pn,
          enabled: true,
          min_app_version: {
            android: "2.36.0.0",
            ios: "2.36.0.0"
          }
        }
      } as Config)
    } as GlobalState);

    const component = renderComponent(state);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when service is not supported", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      features: {
        services: {
          details: {
            dataById: {
              [serviceId]: pot.some(service)
            },
            preferencesById: {
              [serviceId]: pot.some(servicePreferenceWihInboxDisabled)
            }
          }
        }
      },
      remoteConfig: O.some({
        ...backendStatus.config,
        pn: {
          ...backendStatus.config.pn,
          enabled: true,
          min_app_version: {
            android: "2.36.0.0",
            ios: "2.36.0.0"
          }
        }
      } as Config)
    } as GlobalState);

    const component = renderComponent(state);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when service is not active", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      features: {
        services: {
          details: {
            dataById: {
              [serviceId]: pot.some(service)
            },
            preferencesById: {
              [serviceId]: pot.some(servicePreferenceWihInboxDisabled)
            }
          }
        }
      },
      remoteConfig: O.some({
        ...backendStatus.config,
        pn: {
          ...backendStatus.config.pn,
          enabled: true
        }
      } as Config)
    } as GlobalState);

    const component = renderComponent(state);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when service is active", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      features: {
        services: {
          details: {
            dataById: {
              [serviceId]: pot.some(service)
            },
            preferencesById: {
              [serviceId]: pot.some(servicePreferenceWihInboxEnabled)
            }
          }
        }
      },
      remoteConfig: O.some({
        ...backendStatus.config,
        pn: {
          ...backendStatus.config.pn,
          enabled: true
        }
      } as Config)
    } as GlobalState);

    const component = renderComponent(state);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <ServiceDetailsScreenPn activate={false} serviceId={serviceId}>
        <Body>DUMMY</Body>
      </ServiceDetailsScreenPn>
    ),
    "DUMMY",
    {},
    store
  );
};
