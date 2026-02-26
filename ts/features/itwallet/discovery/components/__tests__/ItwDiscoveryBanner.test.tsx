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

type BannerScenario = {
  name: string;
  isWalletActive: boolean;
  isWalletEmpty: boolean;
  hasMdl: boolean;
};

const allScenarios: Array<BannerScenario> = [
  {
    name: "activation banner",
    isWalletActive: false,
    isWalletEmpty: true,
    hasMdl: false
  },
  {
    name: "empty wallet banner",
    isWalletActive: true,
    isWalletEmpty: true,
    hasMdl: false
  },
  {
    name: "MDL upgrade banner",
    isWalletActive: true,
    isWalletEmpty: false,
    hasMdl: true
  },
  {
    name: "default upgrade banner",
    isWalletActive: true,
    isWalletEmpty: false,
    hasMdl: false
  }
];

const setupMocks = (scenario: BannerScenario) => {
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

describe("ItwDiscoveryBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("snapshots", () => {
    test.each(allScenarios)("should match snapshot for $name", scenario => {
      setupMocks(scenario);
      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });
  });

  describe("navigation", () => {
    const onboardingScenarios = allScenarios.filter(
      s => !s.isWalletActive || s.isWalletEmpty
    );

    test.each(onboardingScenarios)(
      "should navigate to onboarding when action button is pressed ($name)",
      scenario => {
        setupMocks(scenario);
        const { getByTestId } = renderComponent();
        const actionButton = getByTestId(
          "itwEngagementBannerActionButtonTestID"
        );

        fireEvent.press(actionButton);

        expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.ONBOARDING
        });
      }
    );
  });

  describe("dismissal behavior", () => {
    const dismissableScenarios = allScenarios.filter(
      ({ isWalletActive, isWalletEmpty }) => !(isWalletActive && isWalletEmpty)
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
