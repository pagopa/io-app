import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import { InstitutionServicesResource } from "../../../../../../definitions/services/InstitutionServicesResource";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as hooks from "../../../common/hooks/useFirstRender";
import { SERVICES_ROUTES } from "../../../common/navigation/routes";
import { InstitutionServicesScreen } from "../InstitutionServicesScreen";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

const MOCK_INSTITUTION_SERVICES: InstitutionServicesResource = {
  count: 3,
  limit: 10,
  offset: 0,
  services: [
    {
      id: "1" as ServiceId,
      name: "Service 1",
      version: 1
    },
    {
      id: "2" as ServiceId,
      name: "Service 2",
      version: 1
    },
    {
      id: "3" as ServiceId,
      name: "Service 3",
      version: 1
    }
  ]
};

const MOCK_NETWORK_ERROR: NetworkError = {
  kind: "generic",
  value: new Error("response status code 500")
};

describe("InstitutionServicesScreen", () => {
  it("should render the skeleton with pot.noneLoading", () => {
    const { component } = renderComponent(pot.noneLoading);

    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(component.queryByTestId("services-header-skeleton")).not.toBeNull();
    expect(component.queryByTestId("service-list-skeleton")).not.toBeNull();
  });

  it("should render the institution's services with pot.some", () => {
    jest.spyOn(hooks, "useFirstRender").mockReturnValue(false);

    const { component } = renderComponent(pot.some(MOCK_INSTITUTION_SERVICES));
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(component.queryByTestId("services-header")).not.toBeNull();
    expect(component.queryByTestId("intitution-services-list")).not.toBeNull();
  });

  it("should render the OperationResultScreenContent component if error occurs during the first request", () => {
    jest.spyOn(hooks, "useFirstRender").mockReturnValue(false);

    const { component } = renderComponent(pot.noneError(MOCK_NETWORK_ERROR));
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(
      component.queryByTestId("service-institution-failure")
    ).not.toBeNull();
  });
});

const renderComponent = (
  paginatedServices: pot.Pot<InstitutionServicesResource, NetworkError>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    features: {
      ...globalState.features,
      services: {
        ...globalState.features.services,
        institution: {
          ...globalState.features.services.institution,
          paginatedServices
        }
      }
    }
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      InstitutionServicesScreen,
      SERVICES_ROUTES.INSTITUTION_SERVICES,
      {
        institutionId: "### id ###",
        institutionName: "### name ###"
      },
      store
    ),
    store
  };
};
