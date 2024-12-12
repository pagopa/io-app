import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as selectors from "../../../store/selectors";
import { ItwDiscoveryBannerStandalone } from "../ItwDiscoveryBannerStandalone";

describe("ItwDiscoveryBannerStandalone", () => {
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
      ItwDiscoveryBannerStandalone,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
