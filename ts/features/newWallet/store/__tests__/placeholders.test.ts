import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { WalletCard } from "../../types";
import { walletAddCards, walletRemoveCards } from "../actions/cards";
import { getWalletPlaceholdersCountByCategorySelector } from "../selectors/placeholders";

const T_CARD_1: WalletCard = {
  category: "bonus",
  key: "1234",
  type: "idPay",
  amount: 123,
  avatarSource: {
    uri: ""
  },
  expireDate: new Date(),
  initiativeId: "123",
  name: "Test"
};
const T_CARD_2: WalletCard = {
  category: "payment",
  key: "9999",
  type: "payment",
  walletId: ""
};
const T_CARD_3: WalletCard = {
  category: "payment",
  key: "4444",
  type: "payment",
  walletId: ""
};

describe("Wallet placeholders reducer", () => {
  it("should start with initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.placeholders).toStrictEqual({});

    const store = createStore(appReducer, globalState as any);

    expect(
      getWalletPlaceholdersCountByCategorySelector(store.getState())
    ).toEqual({});
  });

  it("should get card placeholders count from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.cards).toStrictEqual({});

    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

    expect(
      getWalletPlaceholdersCountByCategorySelector(store.getState())
    ).toEqual({
      [T_CARD_1.category]: 1,
      [T_CARD_2.category]: 2
    });

    store.dispatch(walletRemoveCards([T_CARD_1.key, T_CARD_2.key]));

    expect(
      getWalletPlaceholdersCountByCategorySelector(store.getState())
    ).toEqual({
      [T_CARD_2.category]: 1
    });
  });
});
