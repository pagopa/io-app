import _ from "lodash";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { WalletCardsState } from "../../store/reducers/cards";
import { WalletCategoryFilterTabs } from "../WalletCategoryFilterTabs";

const T_CARDS: WalletCardsState = {
  "1": {
    key: "1",
    type: "payment",
    category: "payment",
    walletId: ""
  },
  "2": {
    key: "2",
    type: "payment",
    category: "payment",
    walletId: ""
  },
  "3": {
    key: "3",
    type: "idPay",
    category: "bonus",
    amount: 1234,
    avatarSource: {
      uri: ""
    },
    expireDate: new Date(),
    initiativeId: "",
    name: "ABC"
  }
};

describe("WalletCategoryFilterTabs", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render tabs based on available categories", () => {
    const { component } = renderComponent(T_CARDS);
    const { queryByTestId } = component;

    expect(queryByTestId(`CategoryTabsContainerTestID`)).not.toBeNull();
    expect(queryByTestId(`CategoryTabTestID-payment`)).not.toBeNull();
    expect(queryByTestId(`CategoryTabTestID-bonus`)).not.toBeNull();
    expect(queryByTestId(`CategoryTabTestID-itw`)).toBeNull();
  });

  it("should not render tabs if only one category", () => {
    const { component } = renderComponent({
      "1": {
        key: "1",
        type: "payment",
        category: "payment",
        walletId: ""
      },
      "2": {
        key: "2",
        type: "payment",
        category: "payment",
        walletId: ""
      }
    });
    const { queryByTestId } = component;

    expect(queryByTestId(`CategoryTabsContainerTestID`)).toBeNull();
    expect(queryByTestId(`CategoryTabTestID-payment`)).toBeNull();
    expect(queryByTestId(`CategoryTabTestID-bonus`)).toBeNull();
    expect(queryByTestId(`CategoryTabTestID-itw`)).toBeNull();
  });
});

const renderComponent = (cards: WalletCardsState) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(globalState, {
      features: {
        wallet: {
          cards
        }
      }
    })
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <WalletCategoryFilterTabs />,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
