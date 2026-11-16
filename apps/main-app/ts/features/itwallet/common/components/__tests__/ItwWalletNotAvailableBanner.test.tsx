import { IOColors } from "@io-app/design-system";
import { createStore } from "redux";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { withDarkTheme } from "../../../../../utils/testColors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as walletInstanceSelectors from "../../../walletInstance/store/selectors";
import { ItwWalletNotAvailableBanner } from "../ItwWalletNotAvailableBanner";

describe("ItwWalletNotAvailableBanner", () => {
  it("should not render when the wallet instance status is available", () => {
    jest
      .spyOn(
        walletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();

    expect(queryByTestId("itwWalletNotAvailableBannerTestID")).toBeNull();
  });

  it("should use the dark neutral banner background in dark mode", () => {
    jest
      .spyOn(
        walletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockReturnValue(true);

    const { getByTestId } = renderComponent();

    expect(getByTestId("itwWalletNotAvailableBannerTestID")).toHaveStyle({
      backgroundColor: IOColors.dark.component.banner.background.neutral
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext(
    withDarkTheme(() => <ItwWalletNotAvailableBanner />),
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
};
