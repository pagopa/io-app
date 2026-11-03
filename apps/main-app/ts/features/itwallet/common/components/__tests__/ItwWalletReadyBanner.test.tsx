import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import { mixpanelTrack } from "../../../../../mixpanel";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as selectors from "../../store/selectors";
import { ItwWalletReadyBanner } from "../ItwWalletReadyBanner";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({ navigate: mockNavigate })
}));

const expectedBannerProperties = {
  banner_id: "itwAddCredential",
  banner_page: "WALLET_HOME",
  banner_landing: "ITW_CARD_ONBOARDING",
  event_category: "UX"
};

describe("ItwWalletReadyBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render", () => {
    jest
      .spyOn(selectors, "itwShouldRenderWalletReadyBannerSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwWalletReadyBannerTestID")).toBeNull();
    expect(mixpanelTrack).not.toHaveBeenCalled();
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
      expect(mixpanelTrack).toHaveBeenCalledTimes(1);
      expect(mixpanelTrack).toHaveBeenCalledWith("BANNER", {
        ...expectedBannerProperties,
        event_type: "screen_view",
        flow: undefined
      });

      fireEvent.press(
        component.getByText(
          I18n.t("features.itWallet.issuance.emptyWallet.readyBanner.action")
        )
      );

      expect(mixpanelTrack).toHaveBeenCalledTimes(2);
      expect(mixpanelTrack).toHaveBeenLastCalledWith("TAP_BANNER", {
        ...expectedBannerProperties,
        event_type: "action",
        flow: undefined
      });
      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: expectedBannerProperties.banner_landing
      });
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
