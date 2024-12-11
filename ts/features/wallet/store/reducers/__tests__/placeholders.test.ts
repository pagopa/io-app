import _ from "lodash";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { WalletCard } from "../../../types";
import { walletAddCards, walletRemoveCards } from "../../actions/cards";
import { walletResetPlaceholders } from "../../actions/placeholders";

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
const T_CARD_4: WalletCard = {
  category: "payment",
  key: "5555",
  type: "payment",
  walletId: "",
  hidden: true
};
const T_CARD_5: WalletCard = {
  category: "payment",
  key: "6666",
  type: "placeholder"
};

describe("Wallet placeholders reducer", () => {
  it("should start with initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    expect(store.getState().features.wallet.placeholders).toStrictEqual({
      items: {},
      isLoading: false
    });
  });

  it("should add cards to the placeholders", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.placeholders).toStrictEqual({
      items: {},
      isLoading: false
    });

    const store = createStore(appReducer, globalState as any);

    store.dispatch(
      walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3, T_CARD_4, T_CARD_5])
    );

    expect(store.getState().features.wallet.placeholders).toStrictEqual({
      items: {
        [T_CARD_1.key]: T_CARD_1.category,
        [T_CARD_2.key]: T_CARD_2.category,
        [T_CARD_3.key]: T_CARD_3.category
      },
      isLoading: false
    });
  });

  it("should remove placeholders", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.placeholders.items", {
        [T_CARD_1.key]: T_CARD_1.category,
        [T_CARD_2.key]: T_CARD_2.category,
        [T_CARD_3.key]: T_CARD_3.category
      }) as any
    );

    store.dispatch(walletRemoveCards([T_CARD_1.key, T_CARD_2.key]));

    expect(store.getState().features.wallet.placeholders).toStrictEqual({
      items: {
        [T_CARD_3.key]: T_CARD_3.category
      },
      isLoading: false
    });
  });

  it("should reset placeholders", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.placeholders.items", {
        [T_CARD_1.key]: T_CARD_1.category,
        [T_CARD_2.key]: T_CARD_2.category
      }) as any
    );

    store.dispatch(walletResetPlaceholders([T_CARD_3, T_CARD_4, T_CARD_5]));

    expect(store.getState().features.wallet.placeholders).toStrictEqual({
      items: {
        [T_CARD_3.key]: T_CARD_3.category
      },
      isLoading: false
    });
  });
});
