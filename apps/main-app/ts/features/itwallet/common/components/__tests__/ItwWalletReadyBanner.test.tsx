import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as selectors from "../../store/selectors";
import { ItwWalletReadyBanner } from "../ItwWalletReadyBanner";

describe("ItwWalletReadyBanner", () => {
  it("should not render", () => {
    jest
      .spyOn(selectors, "itwShouldRenderWalletReadyBannerSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwWalletReadyBannerTestID")).toBeNull();
  });

  test.each`
    isItWallet | titleKey                                                        | contentKey
    ${true}    | ${"features.itWallet.issuance.emptyWallet.readyBanner.title"}   | ${"features.itWallet.issuance.emptyWallet.readyBanner.content"}
    ${false}   | ${"features.itWallet.issuance.emptyWallet.readyBannerL2.title"} | ${"features.itWallet.issuance.emptyWallet.readyBannerL2.content"}
  `(
    "should render the expected banner when isItWallet is $isItWallet",
    ({ isItWallet, titleKey, contentKey }) => {
      jest
        .spyOn(selectors, "itwShouldRenderWalletReadyBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(selectors, "itwShouldRenderNewItWalletSelector")
        .mockReturnValue(isItWallet);

      const component = renderComponent();

      expect(component.getByText(I18n.t(titleKey))).toBeTruthy();
      expect(component.getByText(I18n.t(contentKey))).toBeTruthy();
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
