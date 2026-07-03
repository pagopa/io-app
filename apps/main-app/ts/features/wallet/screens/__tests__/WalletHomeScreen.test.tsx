import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import * as headerFirstLevelHooks from "../../../../hooks/useHeaderFirstLevel";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../ingress/store/selectors";
import * as walletSelectors from "../../store/selectors";
import { WalletHomeScreen } from "../WalletHomeScreen";

const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual<typeof import("@pagopa/io-app-design-system")>(
    "@pagopa/io-app-design-system"
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
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletHomeScreen,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
