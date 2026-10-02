import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import * as headerFirstLevelHooks from "../../../../hooks/useHeaderFirstLevel";
import * as appParamsList from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../ingress/store/selectors";
import { itwSetL2Fallback } from "../../../itwallet/common/store/actions/preferences";
import * as itwSelectors from "../../../itwallet/common/store/selectors";
import * as lifecycleSelectors from "../../../itwallet/lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../itwallet/navigation/routes";
import * as walletSelectors from "../../store/selectors";
import { WalletHomeScreen } from "../WalletHomeScreen";

const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@io-app/design-system"
  ),
  useIOToast: () => ({
    error: mockToastError,
    info: mockToastInfo,
    success: mockToastSuccess
  })
}));

describe("WalletHomeScreen", () => {
  jest.useFakeTimers();
  jest.runAllTimers();

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should not render screen actions if the wallet is empty", () => {
    jest
      .spyOn(walletSelectors, "isWalletEmptySelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent();

    jest.runOnlyPendingTimers();

    expect(queryByTestId("walletAddCardButtonTestID")).toBeNull();
  });

  it("should show an offline toast when the add wallet header action is pressed offline", () => {
    const useHeaderFirstLevelSpy = jest
      .spyOn(headerFirstLevelHooks, "useHeaderFirstLevel")
      .mockImplementation(jest.fn());
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);

    renderComponent();

    const useHeaderFirstLevelCalls = useHeaderFirstLevelSpy.mock.calls;
    const addWalletAction =
      useHeaderFirstLevelCalls[useHeaderFirstLevelCalls.length - 1][0]
        .headerProps.actions?.[0];

    addWalletAction?.onPress(undefined as never);

    expect(mockToastError).toHaveBeenCalledWith(I18n.t("global.offline.toast"));
  });

  test.each([
    {
      name: "fallback activation",
      isL2Fallback: true,
      isL3Enabled: true,
      expectedScreen: ITW_ROUTES.L2_ONBOARDING
    },
    {
      name: "existing Documenti su IO wallet",
      isL2Fallback: false,
      isL3Enabled: true,
      expectedScreen: ITW_ROUTES.L3_ONBOARDING
    },
    {
      name: "L3 disabled",
      isL2Fallback: false,
      isL3Enabled: false,
      expectedScreen: ITW_ROUTES.ONBOARDING
    }
  ])(
    "opens the correct catalogue for $name",
    ({ isL2Fallback, isL3Enabled, expectedScreen }) => {
      const navigate = jest.fn();
      const navigation = appParamsList.useIONavigation;
      const headerSpy = jest
        .spyOn(headerFirstLevelHooks, "useHeaderFirstLevel")
        .mockImplementation(jest.fn());
      jest.spyOn(appParamsList, "useIONavigation").mockImplementation(() => ({
        ...navigation(),
        navigate
      }));
      jest
        .spyOn(connectivitySelectors, "isConnectedSelector")
        .mockReturnValue(true);
      jest
        .spyOn(itwSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(isL3Enabled);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(true);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(false);
      const state = appReducer(
        appReducer(undefined, applicationChangeState("active")),
        itwSetL2Fallback(isL2Fallback)
      );

      renderComponent(state);
      const action =
        headerSpy.mock.calls[headerSpy.mock.calls.length - 1][0].headerProps
          .actions?.[0];
      action?.onPress(undefined as never);

      expect(navigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: expectedScreen
      });
    }
  );
});

const renderComponent = (
  globalState = appReducer(undefined, applicationChangeState("active"))
) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletHomeScreen,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
