import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwIsBannerVisibleSelector } from "../../../common/store/selectors/banners";
import { ItwUpgradeCredentialsBanner } from "../ItwUpgradeCredentialsBanner";

describe("ItwUpgradeCredentialsBanner", () => {
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
      ItwUpgradeCredentialsBanner,
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
  });
});
