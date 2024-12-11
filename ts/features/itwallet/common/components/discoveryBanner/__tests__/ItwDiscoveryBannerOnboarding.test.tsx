import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../../navigation/routes";
import * as selectors from "../../../store/selectors";
import { ItwDiscoveryBannerOnboarding } from "../ItwDiscoveryBannerOnboarding";

describe("ItwDiscoveryBannerOnboarding", () => {
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
