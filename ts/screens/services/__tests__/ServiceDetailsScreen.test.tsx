import { NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";

import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../definitions/backend/ServiceName";
import { OrganizationName } from "../../../../definitions/backend/OrganizationName";
import { DepartmentName } from "../../../../definitions/backend/DepartmentName";
import { loadVisibleServices } from "../../../store/actions/services";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import ServiceDetailsScreen from "../ServiceDetailsScreen";
import ROUTES from "../../../navigation/routes";

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
    it("should render the ogranization's fiscal code", () => {
      const { component, store } = renderComponent();
      store.dispatch(loadVisibleServices.failure(new Error("load failed")));
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
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      ServiceDetailsScreen,
      ROUTES.SERVICE_DETAIL,
      { service },
      store
    ),
    store
  };
};
