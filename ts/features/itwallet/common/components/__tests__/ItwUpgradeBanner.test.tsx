import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as selectors from "../../store/selectors";
import { ItwUpgradeBanner } from "../ItwUpgradeBanner";

describe("ItwUpgradeBanner", () => {
  it.each([true, false])("should render %s", shouldRender => {
    jest
      .spyOn(selectors, "itwShouldRenderL3UpgradeBannerSelector")
      .mockReturnValue(shouldRender);

    const { getByTestId } = renderComponent();

    if (shouldRender) {
      expect(getByTestId("itwUpgradeBannerTestID")).toBeDefined();
    } else {
      expect(() => getByTestId("itwUpgradeBannerTestID")).toThrow();
    }
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwUpgradeBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
