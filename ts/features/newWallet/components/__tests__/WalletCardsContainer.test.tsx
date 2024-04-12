import { within } from "@testing-library/react-native";
import _ from "lodash";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../i18n";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { WalletCardsState } from "../../store/reducers/cards";
import { WalletCardsContainer } from "../WalletCardsContainer";
import { WalletCardCategory } from "../../types";

jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  Layout: {
    duration: jest.fn()
  }
}));

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

describe("WalletCardsContainer", () => {
  jest.useFakeTimers();
  jest.runAllTimers();

  it("should render the cards correctly", () => {
    const { queryByText, queryByTestId } = renderComponent();

    expect(
      queryByText(I18n.t(`features.wallet.cards.categories.payment`))
    ).not.toBeNull();

    const paymentCategoryComponent = queryByTestId(
      `walletCardsCategoryTestID_payment`
    );

    if (paymentCategoryComponent) {
      const { queryByTestId } = within(paymentCategoryComponent);
      expect(queryByTestId(`walletCardTestID_1`)).not.toBeNull();
      expect(queryByTestId(`walletCardTestID_2`)).not.toBeNull();
      expect(queryByTestId(`walletCardTestID_3`)).toBeNull();
    }

    expect(
      queryByText(I18n.t(`features.wallet.cards.categories.bonus`))
    ).not.toBeNull();

    const bonusCategoryComponent = queryByTestId(
      `walletCardsCategoryTestID_bonus`
    );

    if (bonusCategoryComponent) {
      const { queryByTestId } = within(bonusCategoryComponent);
      expect(queryByTestId(`walletCardTestID_1`)).toBeNull();
      expect(queryByTestId(`walletCardTestID_2`)).toBeNull();
      expect(queryByTestId(`walletCardTestID_3`)).not.toBeNull();
    }

    expect(
      queryByText(I18n.t(`features.wallet.cards.categories.cgn`))
    ).toBeNull();
  });

  it("should render only the selected category in the filter tabs", () => {
    const { queryByText, queryByTestId } = renderComponent("payment");

    expect(
      queryByText(I18n.t(`features.wallet.cards.categories.payment`))
    ).not.toBeNull();

    expect(queryByTestId(`walletCardsCategoryTestID_payment`)).not.toBeNull();

    expect(
      queryByText(I18n.t(`features.wallet.cards.categories.bonus`))
    ).toBeNull();

    expect(queryByTestId(`walletCardsCategoryTestID_bonus`)).toBeNull();

    expect(
      queryByText(I18n.t(`features.wallet.cards.categories.cgn`))
    ).toBeNull();

    expect(queryByTestId(`walletCardsCategoryTestID_cgn`)).toBeNull();
  });
});

const renderComponent = (categoryFilter?: WalletCardCategory) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(globalState, {
      features: {
        wallet: {
          cards: T_CARDS,
          preferences: {
            categoryFilter
          }
        }
      }
    } as GlobalState)
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <WalletCardsContainer />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
