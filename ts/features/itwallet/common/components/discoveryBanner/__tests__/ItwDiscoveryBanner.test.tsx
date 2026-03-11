import _ from "lodash";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as useItwDiscoveryBannerTypeModule from "../../../hooks/useItwDiscoveryBannerType";
import { ItwDiscoveryBannerLegacy } from "../ItwDiscoveryBanner";

jest.mock("../../../hooks/useItwDiscoveryBannerType.ts", () => ({
  useItwDiscoveryBannerType: jest.fn()
}));

describe("ItwDiscoveryBanner", () => {
  beforeEach(() => {
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue("onboarding");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot with 'onboarding' banner type", () => {
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot with 'reactivating' banner type", () => {
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue("reactivating");
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should not render banner when banner type is undefined", () => {
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue(undefined);
    const { component } = renderComponent();
    const bannerElement = component.queryByTestId("itwDiscoveryBannerTestID");
    expect(bannerElement).toBeNull();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, globalState as GlobalState)
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ItwDiscoveryBannerLegacy,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
