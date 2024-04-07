import _ from "lodash";
import React from "react";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { WalletCardsState } from "../../store/reducers/cards";
import { WalletHomeScreen } from "../WalletHomeScreen";

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

describe("WalletHomeScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.runAllTimers();
  });

  it("should correctly render empty screen with redirect banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({}, true);

    expect(queryByTestId("walletPaymentsRedirectBannerTestID")).not.toBeNull();
    expect(queryByTestId("walletEmptyScreenContentTestID")).not.toBeNull();
    expect(queryByTestId("walletCardsContainerTestID")).toBeNull();
    expect(queryByTestId("walletAddCardButtonTestID")).toBeNull();
  });

  it("should correctly render empty screen without redirect banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({}, false);

    expect(queryByTestId("walletPaymentsRedirectBannerTestID")).toBeNull();
    expect(queryByTestId("walletEmptyScreenContentTestID")).not.toBeNull();
    expect(queryByTestId("walletCardsContainerTestID")).toBeNull();
    expect(queryByTestId("walletAddCardButtonTestID")).toBeNull();
  });

  it("should correctly render card list screen with redirect banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent(T_CARDS, true);

    expect(queryByTestId("walletPaymentsRedirectBannerTestID")).not.toBeNull();
    expect(queryByTestId("walletEmptyScreenContentTestID")).toBeNull();
    expect(queryByTestId("walletCardsContainerTestID")).not.toBeNull();
    expect(queryByTestId("walletAddCardButtonTestID")).not.toBeNull();
  });

  it("should correctly render card list  screen without redirect banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent(T_CARDS, false);

    expect(queryByTestId("walletPaymentsRedirectBannerTestID")).toBeNull();
    expect(queryByTestId("walletEmptyScreenContentTestID")).toBeNull();
    expect(queryByTestId("walletCardsContainerTestID")).not.toBeNull();
    expect(queryByTestId("walletAddCardButtonTestID")).not.toBeNull();
  });
});

const renderComponent = (
  cards: WalletCardsState,
  shouldShowPaymentsRedirectBanner: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(globalState, {
      features: {
        wallet: {
          cards,
          preferences: {
            shouldShowPaymentsRedirectBanner
          }
        }
      }
    })
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <WalletHomeScreen />,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
