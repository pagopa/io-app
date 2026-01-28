import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwDiscoveryBanner } from "../ItwDiscoveryBanner";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

describe("ItwDiscoveryBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("when wallet is not active", () => {
    beforeEach(() => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);
    });

    it("should match snapshot for activation banner", () => {
      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });

    it("should navigate to onboarding when action button is pressed", () => {
      const { getByTestId } = renderComponent();
      const actionButton = getByTestId("itwEngagementBannerActionButtonTestID");

      fireEvent.press(actionButton);

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.ONBOARDING
      });
    });
  });

  describe("when wallet is active and empty", () => {
    beforeEach(() => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);
    });

    it("should match snapshot for empty wallet banner", () => {
      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });

    it("should navigate to discovery info with L3 level when action button is pressed", () => {
      const { getByTestId } = renderComponent();
      const actionButton = getByTestId("itwEngagementBannerActionButtonTestID");

      fireEvent.press(actionButton);

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { level: "l3" }
      });
    });

    it("should not render close button (not dismissable)", () => {
      const { queryByTestId } = renderComponent();
      expect(queryByTestId("itwEngagementBannerCloseButtonTestID")).toBeNull();
    });
  });

  describe("when wallet is active, not empty, and has MDL", () => {
    beforeEach(() => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(true);
    });

    it("should match snapshot for MDL upgrade banner", () => {
      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });
  });

  describe("when wallet is active, not empty, and does not have MDL", () => {
    beforeEach(() => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);
    });

    it("should match snapshot for default upgrade banner", () => {
      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });
  });

  describe("dismissal behavior", () => {
    type DismissableScenario = {
      name: string;
      isWalletActive: boolean;
      isWalletEmpty: boolean;
      hasMdl: boolean;
    };

    const dismissableScenarios: Array<DismissableScenario> = [
      {
        name: "wallet not active",
        isWalletActive: false,
        isWalletEmpty: true,
        hasMdl: false
      },
      {
        name: "wallet active with MDL",
        isWalletActive: true,
        isWalletEmpty: false,
        hasMdl: true
      },
      {
        name: "wallet active without MDL",
        isWalletActive: true,
        isWalletEmpty: false,
        hasMdl: false
      }
    ];

    const setupMocks = (scenario: DismissableScenario) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(scenario.isWalletActive);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(scenario.isWalletEmpty);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(scenario.hasMdl);
    };

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
