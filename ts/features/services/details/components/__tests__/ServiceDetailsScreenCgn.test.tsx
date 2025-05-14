import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { createStore } from "redux";
import { Body } from "@pagopa/io-app-design-system";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ServiceDetailsScreenCgn } from "../ServiceDetailsScreenCgn";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { applicationChangeState } from "../../../../../store/actions/application";
import { Config } from "../../../../../../definitions/content/Config";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../types/ServicePreferenceResponse";
import { getNetworkError, NetworkError } from "../../../../../utils/errors";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";

const backendStatus: BackendStatus = {
  ...baseRawBackendStatus
};

const serviceId = "serviceCgn" as ServiceId;

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
  id: serviceId,
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
  id: serviceId,
  kind: "success",
  value: {
    inbox: false,
    push: true,
    email: false,
    can_access_message_read_status: false,
    settings_version: 0
  }
};

describe("ServiceDetailsScreenCgn", () => {
  it("should match snapshot when service is not enabled", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      remoteConfig: O.some({
        ...backendStatus.config,
        cgn: {
          ...backendStatus.config.cgn,
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
        cgn: {
          ...backendStatus.config.cgn,
          enabled: true
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
        cgn: {
          ...backendStatus.config.cgn,
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
        cgn: {
          ...backendStatus.config.cgn,
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
      <ServiceDetailsScreenCgn serviceId={serviceId}>
        <Body>DUMMY</Body>
      </ServiceDetailsScreenCgn>
    ),
    "DUMMY",
    {},
    store
  );
};
