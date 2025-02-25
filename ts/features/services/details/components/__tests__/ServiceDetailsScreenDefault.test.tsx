import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { createStore } from "redux";
import { Body } from "@pagopa/io-app-design-system";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { ServicePreferenceResponse } from "../../types/ServicePreferenceResponse";
import {
  ServiceDetailsScreenDefault,
  ServiceDetailsScreenDefaultProps
} from "../ServiceDetailsScreenDefault";
import { CTA } from "../../../../messages/types/MessageCTA";

const serviceId = "serviceDefault" as ServiceId;

const service = {
  service_id: serviceId,
  service_name: "health",
  organization_name: "Ċentru tas-Saħħa",
  department_name: "covid-19",
  organization_fiscal_code: "FSCLCD" as OrganizationFiscalCode
} as ServicePublic;

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
            byId: {
              [serviceId]: pot.some(service)
            },
            servicePreference: pot.some(servicePreferenceWihInboxEnabled)
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
            byId: {
              [serviceId]: pot.some(service)
            },
            servicePreference: pot.some(servicePreferenceWihInboxEnabled)
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
            byId: {
              [serviceId]: pot.some(service)
            },
            servicePreference: pot.some(servicePreferenceWihInboxEnabled)
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
