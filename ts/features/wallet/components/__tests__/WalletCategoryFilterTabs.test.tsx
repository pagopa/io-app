import { fireEvent } from "@testing-library/react-native";
import { AnyAction, Dispatch } from "redux";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import * as hooks from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { walletSetCategoryFilter } from "../../store/actions/preferences";
import * as selectors from "../../store/selectors";
import { WalletCategoryFilterTabs } from "../WalletCategoryFilterTabs";

describe("WalletCategoryFilterTabs", () => {
  it("should not render the component if category filtering is not enabled", () => {
    jest
      .spyOn(selectors, "selectWalletCategoryFilter")
      .mockImplementation(() => undefined);
    jest
      .spyOn(selectors, "isWalletCategoryFilteringEnabledSelector")
      .mockImplementation(() => false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("CategoryTabsContainerTestID")).toBeNull();
  });

  it("should render the component if category filtering is enabled", () => {
    jest
      .spyOn(selectors, "selectWalletCategoryFilter")
      .mockImplementation(() => undefined);
    jest
      .spyOn(selectors, "isWalletCategoryFilteringEnabledSelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("CategoryTabsContainerTestID")).not.toBeNull();
  });

  it("should change the selected category when the user clicks on a tab", () => {
    const mockedDispatch = jest.fn();
    jest
      .spyOn(hooks, "useIODispatch")
      .mockImplementation(() => mockedDispatch as Dispatch<AnyAction>);
    jest
      .spyOn(selectors, "selectWalletCategoryFilter")
      .mockImplementation(() => undefined);
    jest
      .spyOn(selectors, "isWalletCategoryFilteringEnabledSelector")
      .mockImplementation(() => true);

    const { getByTestId } = renderComponent();
    const itwTab = getByTestId("CategoryTabTestID-itw");
    fireEvent.press(itwTab);

    expect(mockedDispatch).toHaveBeenCalledWith(walletSetCategoryFilter("itw"));
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletCategoryFilterTabs,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
