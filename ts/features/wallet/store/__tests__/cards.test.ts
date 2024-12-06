import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { WalletCard } from "../../types";
import {
  walletAddCards,
  walletRemoveCards,
  walletRemoveCardsByType,
  walletUpsertCard
} from "../actions/cards";
import { selectWalletCards } from "../selectors";
import { walletResetPlaceholders } from "../actions/placeholders";
import { paymentsDeleteMethodAction } from "../../../payments/details/store/actions";
import { getNetworkError } from "../../../../utils/errors";

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

describe("Wallet cards reducer", () => {
  it("should start with initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.cards).toStrictEqual({});
  });

  it("should add cards to the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    expect(selectWalletCards(store.getState())).toEqual(
      expect.arrayContaining([T_CARD_1, T_CARD_2, T_CARD_3])
    );
  });

  it("should update a specific card in the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1
    });

    store.dispatch(walletUpsertCard({ ...T_CARD_1, type: "cgn" }));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: { ...T_CARD_1, type: "cgn" }
    });
  });

  it("should add a card in the store if not present another with the same key", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1
    });

    store.dispatch(walletUpsertCard(T_CARD_2));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2
    });
  });

  it("should remove cards from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    store.dispatch(walletRemoveCards([T_CARD_1.key, T_CARD_3.key]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_2.key]: T_CARD_2
    });
  });

  it("should remove cards of the same type from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    store.dispatch(walletRemoveCardsByType("payment"));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1
    });
  });

  it("should remove placeholder cards from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const placeholderCard: WalletCard = { ...T_CARD_1, type: "placeholder" };

    store.dispatch(walletAddCards([placeholderCard, T_CARD_2, T_CARD_3]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [placeholderCard.key]: placeholderCard,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    store.dispatch(walletResetPlaceholders([placeholderCard]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });
  });

  it("should handle paymentsDeleteMethodAction request", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const cardKey = {
      ...T_CARD_1,
      key: "method_1234"
    };

    store.dispatch(walletAddCards([cardKey]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [cardKey.key]: cardKey
    });

    store.dispatch(
      paymentsDeleteMethodAction.request({
        walletId: "1234"
      })
    );

    expect(store.getState().features.wallet.cards).toStrictEqual({
      deletedCard: { ...cardKey, index: 0 }
    });
  });

  it("should handle paymentsDeleteMethodAction cancel and failure", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const networkError = getNetworkError(new Error("test"));

    const cardKey = {
      ...T_CARD_1,
      key: "method_1234"
    };

    store.dispatch(walletAddCards([cardKey, T_CARD_2, T_CARD_3]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [cardKey.key]: cardKey,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    store.dispatch(
      paymentsDeleteMethodAction.request({
        walletId: "1234"
      })
    );

    expect(store.getState().features.wallet.cards).toStrictEqual({
      deletedCard: { ...cardKey, index: 2 },
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    store.dispatch(paymentsDeleteMethodAction.failure(networkError));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [cardKey.key]: { ...cardKey, index: 2 },
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });
  });
});
