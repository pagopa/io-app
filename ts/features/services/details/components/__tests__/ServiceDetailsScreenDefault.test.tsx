import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { createStore } from "redux";
import { Body } from "@pagopa/io-app-design-system";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { ServicePreferenceResponse } from "../../types/ServicePreferenceResponse";
import {
  ServiceDetailsScreenDefault,
  ServiceDetailsScreenDefaultProps
} from "../ServiceDetailsScreenDefault";
import { CTA } from "../../../../../types/LocalizedCTAs";

const serviceId = "serviceDefault" as ServiceId;

const service = {
  id: serviceId,
  name: "health",
  organization: {
    fiscal_code: "FSCLCD" as OrganizationFiscalCode,
    name: "Ċentru tas-Saħħa"
  }
} as ServiceDetails;

const servicePreferenceWihInboxEnabled: ServicePreferenceResponse = {
  id: serviceId,
  kind: "success",
  value: {
    inbox: true,
    push: true,
    email: true,
    can_access_message_read_status: true,
    settings_version: 0
  }
};

const cta_1: CTA = {
  text: "CTA_1",
  action: ""
};

const cta_2: CTA = {
  text: "CTA_2",
  action: ""
};

describe("ServiceDetailsScreenDefault", () => {
  it("should match snapshot when service has no cta", () => {
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
      }
    } as GlobalState);
    const component = renderComponent({}, state);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when the service has only one cta", () => {
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
      }
    } as GlobalState);
    const component = renderComponent({ ctas: { cta_1 } }, state);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when the service has two ctas", () => {
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
      }
    } as GlobalState);
    const component = renderComponent({ ctas: { cta_1, cta_2 } }, state);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  props: Omit<ServiceDetailsScreenDefaultProps, "children">,
  state: GlobalState
) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <ServiceDetailsScreenDefault {...props} onPressCta={() => null}>
        <Body>DUMMY</Body>
      </ServiceDetailsScreenDefault>
    ),
    "DUMMY",
    {},
    store
  );
};
