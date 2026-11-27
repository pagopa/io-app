import { StackActions } from "@react-navigation/native";
import { act, fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { mixpanelTrack } from "../../../../../mixpanel";
import { navigationRef } from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { useIOSelector } from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwIsBannerVisibleSelector } from "../../../common/store/selectors/banners";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwUpgradeCredentialsBanner } from "../ItwUpgradeCredentialsBanner";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

const UpgradeBannerScreen = () =>
  useIOSelector(itwIsBannerVisibleSelector("upgradeCredentials")) ? (
    <ItwUpgradeCredentialsBanner />
  ) : null;

describe("ItwUpgradeCredentialsBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    { name: "wallet", route: ROUTES.WALLET_HOME },
    { name: "offline wallet", route: ITW_ROUTES.OFFLINE.WALLET }
  ])("tracks the banner in the $name", ({ route }) => {
    const store = createStore(appReducer);
    store.dispatch(applicationChangeState("active"));
    renderScreenWithNavigationStoreContext(
      UpgradeBannerScreen,
      route,
      {},
      store
    );

    expect(mixpanelTrack).toHaveBeenCalledTimes(1);
    expect(mixpanelTrack).toHaveBeenCalledWith("BANNER", {
      banner_id: "itwUpgradeCredentialsBanner",
      banner_page: route,
      banner_landing: route,
      banner_campaign: I18n.t(
        "features.itWallet.issuance.upgrade.banner.title"
      ),
      event_category: "UX",
      event_type: "screen_view",
      flow: undefined
    });
  });

  it("tracks the banner again when the screen regains focus", async () => {
    const store = createStore(appReducer);
    store.dispatch(applicationChangeState("active"));
    renderScreenWithNavigationStoreContext(
      UpgradeBannerScreen,
      ROUTES.WALLET_HOME,
      {},
      store
    );

    act(() =>
      navigationRef.current?.dispatch(StackActions.push(ROUTES.WALLET_HOME))
    );
    await act(() => new Promise(resolve => setTimeout(resolve, 500)));
    act(() => navigationRef.current?.dispatch(StackActions.pop()));
    await act(() => new Promise(resolve => setTimeout(resolve, 500)));

    expect(mixpanelTrack).toHaveBeenCalledTimes(3);
  });

  test.each([
    {
      name: "acknowledgement",
      label: I18n.t("features.itWallet.issuance.upgrade.banner.action")
    },
    { name: "close button", label: I18n.t("global.buttons.close") }
  ])("persists dismissal through $name", ({ label }) => {
    const store = createStore(appReducer);
    store.dispatch(applicationChangeState("active"));
    const screen = renderScreenWithNavigationStoreContext(
      UpgradeBannerScreen,
      ROUTES.WALLET_HOME,
      {},
      store
    );

    fireEvent.press(screen.getByRole("button", { name: label }));

    expect(
      itwIsBannerVisibleSelector("upgradeCredentials")(store.getState())
    ).toBe(false);
    expect(
      store.getState().features.itWallet.banners.upgradeCredentials
        ?.dismissCount
    ).toBe(1);

    expect(screen.queryByRole("button", { name: label })).toBeNull();
    expect(mixpanelTrack).toHaveBeenCalledTimes(1);
  });
});
