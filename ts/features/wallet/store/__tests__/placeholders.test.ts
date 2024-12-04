import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { WalletCard } from "../../types";
import { walletAddCards } from "../actions/cards";
import { selectIsWalletCardsLoading } from "../selectors";

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
    expect(globalState.features.wallet.placeholders).toStrictEqual({
      items: {},
      isLoading: false
    });

    const store = createStore(appReducer, globalState as any);

    expect(selectIsWalletCardsLoading(store.getState())).toEqual(false);
  });

  it("should disable loading state when at least a card is added", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.placeholders).toStrictEqual({
      items: {},
      isLoading: false
    });

    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

    expect(selectIsWalletCardsLoading(store.getState())).toEqual(false);
  });
});
