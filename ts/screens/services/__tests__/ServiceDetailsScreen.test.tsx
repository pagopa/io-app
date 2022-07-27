import configureMockStore from "redux-mock-store";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../definitions/backend/ServiceName";
import { OrganizationName } from "../../../../definitions/backend/OrganizationName";
import { DepartmentName } from "../../../../definitions/backend/DepartmentName";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import ServiceDetailsScreen from "../ServiceDetailsScreen";
import ROUTES from "../../../navigation/routes";
import {
  loadServiceDetail,
  loadVisibleServices
} from "../../../store/actions/services";

jest.useFakeTimers();

const service: ServicePublic = {
  service_id: "A01" as ServiceId,
  service_name: "ciao service" as ServiceName,
  organization_name: "org" as OrganizationName,
  department_name: "dep" as DepartmentName,
  organization_fiscal_code: "12341234" as OrganizationFiscalCode,
  version: 1
};

describe("ServiceDetailsScreen", () => {
  describe("when service's data load fails", () => {
    it("should render the organization's fiscal code even if services list load is in failure", () => {
      const { component, store } = renderComponent();
      store.dispatch(loadVisibleServices.failure(new Error("load failed")));
      expect(
        component.getByText(service.organization_fiscal_code)
      ).toBeDefined();
    });

    it("should render the organization's fiscal code even if service detail load is in failure", () => {
      const { component, store } = renderComponent();
      store.dispatch(
        loadServiceDetail.failure({
          error: new Error("load failed"),
          service_id: service.service_id
        })
      );
      expect(
        component.getByText(service.organization_fiscal_code)
      ).toBeDefined();
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    entities: {
      ...globalState.entities,
      services: {
        ...globalState.entities.services,
        byId: {
          [service.service_id]: pot.some(service)
        }
      }
    }
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ServiceDetailsScreen,
      ROUTES.SERVICE_DETAIL,
      { serviceId: service.service_id },
      store
    ),
    store
  };
};
