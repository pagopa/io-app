import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { createStore } from "redux";
import _ from "lodash";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FeaturedServiceList } from "../FeaturedServiceList";
import { getNetworkError, NetworkError } from "../../../../../utils/errors";
import { FeaturedServices } from "../../../../../../definitions/services/FeaturedServices";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

const MOCK_FEATURED_SERVICES: FeaturedServices = {
  services: [
    {
      id: "aServiceId1" as ServiceId,
      name: "Service Name 1",
      version: 1
    },
    {
      id: "aServiceId2" as ServiceId,
      name: "Service Name 2",
      version: 1
    },
    {
      id: "aServiceId3" as ServiceId,
      name: "Service Name 3",
      version: 1,
      organization_name: "Organization Name"
    }
  ]
};

jest.mock("../../../../../utils/hooks/useOnFirstRender", () => ({
  useOnFirstRender: jest.fn(() => null)
}));

describe("FeaturedServiceList", () => {
  it.each([
    pot.none,
    pot.some({ services: [] }) // empty list
  ])("should not render when featuredServices is %s", featuredServicesPot => {
    const { queryByText } = renderComponent(featuredServicesPot);
    expect(
      queryByText(I18n.t("services.home.featured.services.title"))
    ).toBeNull();
  });

  it.each([pot.noneLoading])(
    "should render skeleton when featuredServices is %s",
    featuredServicesPot => {
      const { queryByTestId } = renderComponent(featuredServicesPot);
      expect(queryByTestId("feature-service-list-skeleton")).not.toBeNull();
    }
  );

  it.each([
    pot.some(MOCK_FEATURED_SERVICES),
    pot.someLoading(MOCK_FEATURED_SERVICES)
  ])("should render when featuredServices is %s", featuredServicesPot => {
    const { queryByTestId } = renderComponent(featuredServicesPot);
    expect(queryByTestId("feature-service-list")).not.toBeNull();
  });

  it.each([pot.noneError(getNetworkError(new Error("GenericError")))])(
    "should render error banner when featuredServices is %s",
    featuredServicesPot => {
      const { queryByTestId } = renderComponent(featuredServicesPot);
      expect(queryByTestId("feature-service-list-error")).not.toBeNull();
    }
  );
});

const renderComponent = (
  featuredServices: pot.Pot<FeaturedServices, NetworkError>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState = _.merge(undefined, globalState, {
    features: {
      services: {
        home: {
          featuredServices
        }
      }
    }
  } as unknown as GlobalState);
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <FeaturedServiceList />,
    "DUMMY",
    {},
    store
  );
};
