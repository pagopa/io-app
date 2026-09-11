import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as commonSelectors from "../../../common/store/selectors";
import * as securePreferencesSelectors from "../../../common/store/selectors/securePreferences";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as proximityAnalytics from "../../../presentation/proximity/analytics";
import { ITW_PROXIMITY_ROUTES } from "../../../presentation/proximity/navigation/routes";
import * as walletAnalytics from "../../analytics";
import { ItwOfflineWalletScreen } from "../ItwOfflineWalletScreen";

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockSetOptions
  })
}));

jest.mock("../../components/ItwWalletCardsContainer", () => ({
  ItwWalletCardsContainer: () => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      testID: "itwWalletCardsContainerTestID"
    });
  }
}));

const presentCtaLabel = I18n.t("features.itWallet.presentation.ctas.present");

describe("ItwOfflineWalletScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setGate({ limitReached: false, warning: false });
    jest
      .spyOn(commonSelectors, "isItwProximityEnabledSelector")
      .mockReturnValue(false);
    jest
      .spyOn(walletAnalytics, "trackItwOfflineWallet")
      .mockImplementation(jest.fn());
    jest
      .spyOn(proximityAnalytics, "trackItwProximityShowQrCode")
      .mockImplementation(jest.fn());
  });

  it("renders wallet content when offline access is allowed", () => {
    const { getByText, getByTestId, queryByTestId } = renderComponent();

    expect(getByText(I18n.t("wallet.wallet"))).toBeTruthy();
    expect(getByTestId("itwWalletCardsContainerTestID")).toBeTruthy();
    expect(queryByTestId("itwOfflineAccessGateWarningTestID")).toBeNull();
    expect(queryByTestId("itwOfflineAccessGateLimitReachedTestID")).toBeNull();
  });

  it("tracks the offline wallet screen view on first render", () => {
    renderComponent();

    expect(walletAnalytics.trackItwOfflineWallet).toHaveBeenCalledTimes(1);
  });

  it("hides the navigator header", () => {
    renderComponent();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
      header: undefined
    });
  });

  it("does not show the present CTA when proximity is disabled", () => {
    const { queryByText } = renderComponent();

    expect(queryByText(presentCtaLabel)).toBeNull();
  });

  it("shows the present CTA when proximity is enabled", () => {
    jest
      .spyOn(commonSelectors, "isItwProximityEnabledSelector")
      .mockReturnValue(true);

    const { getByText } = renderComponent();

    expect(getByText(presentCtaLabel)).toBeTruthy();
  });

  it("tracks and navigates to presentment when the present CTA is pressed", () => {
    jest
      .spyOn(commonSelectors, "isItwProximityEnabledSelector")
      .mockReturnValue(true);

    const { getByText } = renderComponent();
    fireEvent.press(getByText(presentCtaLabel));

    expect(proximityAnalytics.trackItwProximityShowQrCode).toHaveBeenCalledWith(
      {
        credential: "general",
        position: "WALLET_HOME"
      }
    );
    expect(mockNavigate).toHaveBeenCalledWith(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.PRESENTMENT,
      params: {
        source: "WALLET_HOME"
      }
    });
  });

  it.each([
    {
      name: "limit warning",
      warning: true,
      limitReached: false,
      testID: "itwOfflineAccessGateWarningTestID"
    },
    {
      name: "limit reached",
      warning: false,
      limitReached: true,
      testID: "itwOfflineAccessGateLimitReachedTestID"
    }
  ])(
    "shows $name instead of wallet content",
    ({ warning, limitReached, testID }) => {
      setGate({ warning, limitReached });

      const { getByTestId, queryByTestId, queryByText } = renderComponent();

      expect(getByTestId(testID)).toBeTruthy();
      expect(queryByTestId("itwWalletCardsContainerTestID")).toBeNull();
      expect(queryByText(presentCtaLabel)).toBeNull();
      expect(walletAnalytics.trackItwOfflineWallet).not.toHaveBeenCalled();
    }
  );

  it("shows wallet content after the limit warning is dismissed", () => {
    setGate({ warning: true, limitReached: false });

    const { getByTestId, queryByTestId } = renderComponent();
    fireEvent.press(getByTestId("itwOfflineAccessGateWarningActionTestID"));

    expect(queryByTestId("itwOfflineAccessGateWarningTestID")).toBeNull();
    expect(getByTestId("itwWalletCardsContainerTestID")).toBeTruthy();
    expect(walletAnalytics.trackItwOfflineWallet).toHaveBeenCalledTimes(1);
  });
});

const setGate = ({
  limitReached,
  warning
}: {
  limitReached: boolean;
  warning: boolean;
}) => {
  jest
    .spyOn(securePreferencesSelectors, "itwIsOfflineAccessLimitReached")
    .mockReturnValue(limitReached);
  jest
    .spyOn(
      securePreferencesSelectors,
      "itwShouldDisplayOfflineAccessLimitWarning"
    )
    .mockReturnValue(warning);
};

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    ItwOfflineWalletScreen,
    ITW_ROUTES.OFFLINE.WALLET,
    {},
    store
  );
};
