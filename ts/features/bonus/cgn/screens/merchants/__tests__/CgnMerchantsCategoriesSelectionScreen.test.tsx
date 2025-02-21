import { createStore } from "redux";
import CgnMerchantsCategoriesSelectionScreen, {
  CgnMerchantsHomeTabRoutes
} from "../CgnMerchantsCategoriesSelectionScreen";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import I18n from "../../../../../../i18n";
import CGN_ROUTES from "../../../navigation/routes";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("../../../hooks/useDisableRootNavigatorGesture", () => ({
  useDisableRootNavigatorGesture: jest.fn()
}));

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
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
    const { toJSON } = renderComponent(defaultState);
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render the title", () => {
    const { getByText } = renderComponent(defaultState);
    expect(
      getByText(I18n.t("bonus.cgn.merchantsList.screenTitle"))
    ).toBeTruthy();
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
});
