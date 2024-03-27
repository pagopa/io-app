import * as React from "react";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import {
  WalletCardsCategoryContainer,
  WalletCategoryStackContainerProps
} from "../WalletCardsCategoryContainer";

describe("WalletCardsCategoryContainer", () => {
  const T_CATEGORY_LABEL = "Category ABC";
  const T_KEY = "12345";
  it("should correctly render the component", () => {
    const {
      component: { queryByTestId, queryByText }
    } = renderComponent({
      cards: [
        { key: T_KEY, type: "payment", category: "payment", walletId: "" }
      ],
      iconName: "bonus",
      label: T_CATEGORY_LABEL
    });
    expect(queryByText(T_CATEGORY_LABEL)).not.toBeNull();
    expect(queryByTestId(`wallet_card_${T_KEY}`)).not.toBeNull();
  });
  it("should not render the component if no cards are provided", () => {
    const {
      component: { queryByTestId, queryByText }
    } = renderComponent({
      cards: [],
      iconName: "bonus",
      label: T_CATEGORY_LABEL
    });
    expect(queryByText(T_CATEGORY_LABEL)).toBeNull();
    expect(queryByTestId(`wallet_card_${T_KEY}`)).toBeNull();
  });
});

const renderComponent = (props: WalletCategoryStackContainerProps) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <WalletCardsCategoryContainer {...props} />,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
