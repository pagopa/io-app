import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwWalletReadyBanner } from "../ItwWalletReadyBanner";
import { GlobalState } from "../../../../../store/reducers/types";
import * as selectors from "../../store/selectors";

describe("ItwWalletReadyBanner", () => {
  it("should not render", () => {
    jest
      .spyOn(selectors, "itwShouldRenderWalletReadyBannerSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwWalletReadyBannerTestID")).toBeNull();
  });

  test.each([true, false])(
    "should match snapshot when ITW new interface active status is %p",
    isActive => {
      jest
        .spyOn(selectors, "itwShouldRenderWalletReadyBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(selectors, "itwShouldRenderNewItWalletSelector")
        .mockReturnValue(isActive);

      const component = renderComponent();
      expect(component).toMatchSnapshot();
    }
  );
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwWalletReadyBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
