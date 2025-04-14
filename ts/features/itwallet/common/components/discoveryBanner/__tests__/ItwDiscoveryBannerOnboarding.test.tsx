import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../../navigation/routes";
import * as selectors from "../../../store/selectors";
import { ItwDiscoveryBannerOnboarding } from "../ItwDiscoveryBannerOnboarding";
import * as useItwDiscoveryBannerTypeModule from "../../../hooks/useItwDiscoveryBannerType.ts";

jest.mock("../../../hooks/useItwDiscoveryBannerType.ts", () => ({
  useItwDiscoveryBannerType: jest.fn()
}));

describe("ItwDiscoveryBannerOnboarding", () => {
  beforeEach(() => {
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue("onboarding");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each([true, false] as ReadonlyArray<boolean>)(
    "should match snapshot when isItwDiscoveryBannerRenderable is %p",
    isItwDiscoveryBannerRenderable => {
      jest
        .spyOn(selectors, "isItwDiscoveryBannerRenderableSelector")
        .mockImplementation(() => isItwDiscoveryBannerRenderable);

      const { component } = renderComponent();
      expect(component.toJSON()).toMatchSnapshot();
    }
  );

  it("should match snapshot with 'onboarding' banner type", () => {
    jest
      .spyOn(selectors, "isItwDiscoveryBannerRenderableSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue("onboarding");
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot with 'reactivating' banner type", () => {
    jest
      .spyOn(selectors, "isItwDiscoveryBannerRenderableSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue("reactivating");
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should not render banner content when banner type is undefined", () => {
    jest
      .spyOn(selectors, "isItwDiscoveryBannerRenderableSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue(undefined);
    const { component } = renderComponent();
    const bannerElement = component.queryByTestId(
      "itwDiscoveryBannerOnboardingTestID"
    );
    expect(bannerElement).toBeNull();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    globalState as GlobalState
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ItwDiscoveryBannerOnboarding,
      ITW_ROUTES.ONBOARDING,
      {},
      store
    ),
    store
  };
};
