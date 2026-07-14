import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../../ingress/store/selectors";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as itwWalletInstanceSelectors from "../../../walletInstance/store/selectors";
import { ItwDiscoveryBanner } from "../ItwDiscoveryBanner";

const mockNavigate = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

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

type BannerScenario = {
  hasItwInstance: boolean;
  hasMdl: boolean;
  isRemotelyActive?: boolean;
  isWalletActive: boolean;
  isWalletEmpty: boolean;
  name: string;
};

const allScenarios: Array<BannerScenario> = [
  {
    name: "activation banner",
    isWalletActive: false,
    hasItwInstance: false,
    isRemotelyActive: false,
    isWalletEmpty: true,
    hasMdl: false
  },
  {
    name: "empty wallet banner",
    isWalletActive: true,
    hasItwInstance: true,
    isRemotelyActive: false,
    isWalletEmpty: true,
    hasMdl: false
  },
  {
    name: "MDL upgrade banner",
    isWalletActive: true,
    hasItwInstance: true,
    isRemotelyActive: false,
    isWalletEmpty: false,
    hasMdl: true
  },
  {
    name: "default upgrade banner",
    isWalletActive: true,
    hasItwInstance: true,
    isRemotelyActive: false,
    isWalletEmpty: false,
    hasMdl: false
  },
  {
    name: "reactivation banner",
    isWalletActive: false,
    hasItwInstance: false,
    isRemotelyActive: true,
    isWalletEmpty: true,
    hasMdl: false
  }
];

const setupMocks = (scenario: BannerScenario) => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
    .mockReturnValue(scenario.isWalletActive);

  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
    .mockReturnValue(scenario.hasItwInstance);

  jest
    .spyOn(itwWalletInstanceSelectors, "itwIsRemotelyActiveSelector")
    .mockReturnValue(scenario.isRemotelyActive);

  jest
    .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
    .mockReturnValue(scenario.isWalletEmpty);

  jest
    .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
    .mockReturnValue(scenario.hasMdl);
};

describe("ItwDiscoveryBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("skeleton", () => {
    it("should render skeleton while remote wallet instance state is loading and wallet is not active", () => {
      setupMocks({
        name: "skeleton",
        isWalletActive: false,
        hasItwInstance: false,
        isRemotelyActive: undefined,
        isWalletEmpty: true,
        hasMdl: false
      });

      const component = renderComponent();

      expect(component.toJSON()).toMatchSnapshot();
    });

    it("should not render skeleton when wallet is active", () => {
      setupMocks({
        name: "active wallet",
        isWalletActive: true,
        hasItwInstance: true,
        isRemotelyActive: undefined,
        isWalletEmpty: true,
        hasMdl: false
      });

      const { queryByTestId } = renderComponent();

      expect(
        queryByTestId("itwEngagementBannerActionButtonTestID")
      ).not.toBeNull();
    });
  });

  describe("snapshots", () => {
    test.each(allScenarios)("should match snapshot for $name", scenario => {
      setupMocks(scenario);
      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });
  });

  describe("navigation", () => {
    const discoveryScenarios = allScenarios.filter(s => !s.isRemotelyActive);

    test.each(discoveryScenarios)(
      "should navigate to the discovery landing when action button is pressed ($name)",
      scenario => {
        setupMocks(scenario);
        const { getByTestId } = renderComponent();
        const actionButton = getByTestId(
          "itwEngagementBannerActionButtonTestID"
        );

        fireEvent.press(actionButton);

        expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.DISCOVERY.INFO,
          params: { level: "l3" }
        });
      }
    );

    it("should navigate to discovery screen when reactivation banner action is pressed", () => {
      setupMocks({
        name: "reactivation banner",
        isWalletActive: false,
        hasItwInstance: false,
        isRemotelyActive: true,
        isWalletEmpty: true,
        hasMdl: false
      });

      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId("itwReactivationBannerTestID"));

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { level: "l3" }
      });
    });

    it("should show an offline toast and block navigation when the empty wallet banner action is pressed offline", () => {
      setupMocks({
        name: "empty wallet banner",
        isWalletActive: true,
        hasItwInstance: true,
        isRemotelyActive: false,
        isWalletEmpty: true,
        hasMdl: false
      });
      jest
        .spyOn(connectivitySelectors, "isConnectedSelector")
        .mockReturnValue(false);

      const { getByTestId } = renderComponent();
      const actionButton = getByTestId("itwEngagementBannerActionButtonTestID");

      fireEvent.press(actionButton);

      expect(mockToastError).toHaveBeenCalledWith(
        I18n.t("global.offline.toast")
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("dismissal behavior", () => {
    const dismissableScenarios = allScenarios.filter(
      ({ isWalletActive, isWalletEmpty, isRemotelyActive }) =>
        !isRemotelyActive && !(isWalletActive && isWalletEmpty)
    );
    const nonDismissableScenarios = allScenarios.filter(
      ({ isWalletActive, isWalletEmpty }) => isWalletActive && isWalletEmpty
    );

    test.each(dismissableScenarios)(
      "should render close button when $name",
      scenario => {
        setupMocks(scenario);
        const { getByTestId } = renderComponent();
        expect(
          getByTestId("itwEngagementBannerCloseButtonTestID")
        ).not.toBeNull();
      }
    );

    test.each(dismissableScenarios)(
      "should dispatch itwCloseBanner action when close button is pressed ($name)",
      scenario => {
        setupMocks(scenario);
        const { getByTestId, store } = renderComponent();
        const closeButton = getByTestId("itwEngagementBannerCloseButtonTestID");

        fireEvent.press(closeButton);

        const actions = store.getActions();
        expect(actions).toContainEqual(itwCloseBanner("discovery_wallet"));
      }
    );

    test.each(nonDismissableScenarios)(
      "should not render close button when $name",
      scenario => {
        setupMocks(scenario);
        const { queryByTestId } = renderComponent();
        expect(
          queryByTestId("itwEngagementBannerCloseButtonTestID")
        ).toBeNull();
      }
    );
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    ...renderScreenWithNavigationStoreContext<GlobalState>(
      ItwDiscoveryBanner,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
