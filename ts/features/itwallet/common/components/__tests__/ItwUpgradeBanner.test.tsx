import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as commonSelectors from "../../store/selectors";
import { ItwUpgradeBanner } from "../ItwUpgradeBanner";

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

describe("ItwUpgradeBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("when banner is not visible", () => {
    it("should return null and not render anything", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);

      const { queryByTestId } = renderComponent();
      expect(queryByTestId("itwEngagementBannerActionButtonTestID")).toBeNull();
    });
  });

  describe("when banner is visible and wallet is empty", () => {
    it("should match snapshot for empty wallet banner", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);

      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });

    it("should navigate to discovery info with L3 level when action button is pressed", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);

      const { getByTestId } = renderComponent();
      const actionButton = getByTestId("itwEngagementBannerActionButtonTestID");

      fireEvent.press(actionButton);

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { level: "l3" }
      });
    });

    it("should not render close button (not dismissable)", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);

      const { queryByTestId } = renderComponent();
      expect(queryByTestId("itwEngagementBannerCloseButtonTestID")).toBeNull();
    });
  });

  describe("when banner is visible, wallet is not empty, and has MDL", () => {
    it("should match snapshot for MDL upgrade banner", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(true);

      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });

    it("should navigate to discovery info with L3 level when action button is pressed", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(true);

      const { getByTestId } = renderComponent();
      const actionButton = getByTestId("itwEngagementBannerActionButtonTestID");

      fireEvent.press(actionButton);

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { level: "l3" }
      });
    });

    it("should render close button (dismissable)", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(true);

      const { getByTestId } = renderComponent();
      expect(
        getByTestId("itwEngagementBannerCloseButtonTestID")
      ).not.toBeNull();
    });
  });

  describe("when banner is visible, wallet is not empty, and does not have MDL (default upgrade)", () => {
    it("should match snapshot for default upgrade banner", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);

      const component = renderComponent();
      expect(component).toMatchSnapshot();
    });

    it("should navigate to discovery info with L3 level when action button is pressed", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);

      const { getByTestId } = renderComponent();
      const actionButton = getByTestId("itwEngagementBannerActionButtonTestID");

      fireEvent.press(actionButton);

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { level: "l3" }
      });
    });

    it("should render close button (dismissable)", () => {
      jest
        .spyOn(commonSelectors, "itwShouldRenderUpgradeBannerSelector")
        .mockReturnValue(true);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      jest
        .spyOn(credentialsSelectors, "itwIsMdlPresentSelector")
        .mockReturnValue(false);

      const { getByTestId } = renderComponent();
      expect(
        getByTestId("itwEngagementBannerCloseButtonTestID")
      ).not.toBeNull();
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwUpgradeBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
