import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import CgnMerchantsCategoriesSelectionScreen, {
  CgnMerchantsHomeTabRoutes
} from "../CgnMerchantsCategoriesSelectionScreen";

jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("../../../hooks/useDisableRootNavigatorGesture", () => ({
  useDisableRootNavigatorGesture: jest.fn()
}));

const globalState = appReducer(undefined, applicationChangeState("active"));

const defaultState: GlobalState = {
  ...globalState,
  bonus: {
    ...globalState.bonus,
    cgn: {
      ...globalState.bonus.cgn
    }
  }
};

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    CgnMerchantsCategoriesSelectionScreen,
    CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES,
    {},
    store
  );
};

const mockNavigate = jest.fn();
(useIONavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });

describe("CgnMerchantsCategoriesSelectionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const component = renderComponent(defaultState);
    expect(component).toBeTruthy();
  });

  it("should render the tab navigation with categories and merchants tabs", () => {
    const { getByTestId } = renderComponent(defaultState);

    expect(
      getByTestId(
        `cgn-merchants-tab-${CgnMerchantsHomeTabRoutes.CGN_CATEGORIES}`
      )
    ).toBeTruthy();
    expect(
      getByTestId(
        `cgn-merchants-tab-${CgnMerchantsHomeTabRoutes.CGN_MERCHANTS_ALL}`
      )
    ).toBeTruthy();
  });

  it("should navigate to search screen when search button is pressed", () => {
    const { getByTestId } = renderComponent(defaultState);

    const searchButton = getByTestId("search-button");

    fireEvent.press(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.MERCHANTS.SEARCH
    });
  });

  it("should navigate to categories screen when categories tab is pressed", () => {
    const { getByTestId, getByText } = renderComponent(defaultState);

    const categoriesTab = getByTestId(
      `cgn-merchants-tab-${CgnMerchantsHomeTabRoutes.CGN_CATEGORIES}`
    );

    fireEvent.press(categoriesTab);

    expect(
      getByText(I18n.t("bonus.cgn.merchantsList.tabs.perMerchant"))
    ).toBeTruthy();
  });
});
