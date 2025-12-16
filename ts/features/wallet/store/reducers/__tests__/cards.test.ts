import _ from "lodash";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { WalletCard } from "../../../types";
import {
  walletAddCards,
  walletHideCards,
  walletRemoveCards,
  walletRemoveCardsByCategory,
  walletRemoveCardsByType,
  walletRestoreCards,
  walletUpsertCard
} from "../../actions/cards";
import { walletResetPlaceholders } from "../../actions/placeholders";
import { selectWalletCards } from "../../selectors";

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
  key: "method_1234",
  type: "payment",
  walletId: "1234"
};
const T_CARD_3: WalletCard = {
  category: "payment",
  key: "method_5678",
  type: "payment",
  walletId: "5678"
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
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [T_CARD_1.key]: T_CARD_1
      }) as any
    );

    store.dispatch(walletUpsertCard({ ...T_CARD_1, type: "cgn" }));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: { ...T_CARD_1, type: "cgn" }
    });
  });

  it("should add a card in the store if not present another with the same key", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [T_CARD_1.key]: T_CARD_1
      }) as any
    );

    store.dispatch(walletUpsertCard(T_CARD_2));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2
    });
  });

  it("should remove cards from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [T_CARD_1.key]: T_CARD_1,
        [T_CARD_2.key]: T_CARD_2,
        [T_CARD_3.key]: T_CARD_3
      }) as any
    );

    store.dispatch(walletRemoveCards([T_CARD_1.key, T_CARD_3.key]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_2.key]: T_CARD_2
    });
  });

  it("should remove cards of the same type from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [T_CARD_1.key]: T_CARD_1,
        [T_CARD_2.key]: T_CARD_2,
        [T_CARD_3.key]: T_CARD_3
      }) as any
    );

    store.dispatch(walletRemoveCardsByType("payment"));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1
    });
  });

  it("should remove cards of the same category from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [T_CARD_1.key]: T_CARD_1,
        [T_CARD_2.key]: T_CARD_2,
        [T_CARD_3.key]: T_CARD_3
      }) as any
    );

    store.dispatch(walletRemoveCardsByCategory("payment"));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1
    });
  });

  it("should remove placeholder cards from the store", () => {
    const placeholderCard: WalletCard = { ...T_CARD_1, type: "placeholder" };
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [placeholderCard.key]: placeholderCard,
        [T_CARD_2.key]: T_CARD_2,
        [T_CARD_3.key]: T_CARD_3
      }) as any
    );

    store.dispatch(walletResetPlaceholders([placeholderCard]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });
  });

  it("should hide cards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [T_CARD_1.key]: T_CARD_1,
        [T_CARD_2.key]: T_CARD_2,
        [T_CARD_3.key]: T_CARD_3
      }) as any
    );

    store.dispatch(walletHideCards([T_CARD_2.key]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: { ...T_CARD_2, hidden: true },
      [T_CARD_3.key]: T_CARD_3
    });
  });

  it("should restore hidden cards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(
      appReducer,
      _.set(globalState, "features.wallet.cards", {
        [T_CARD_1.key]: T_CARD_1,
        [T_CARD_2.key]: { ...T_CARD_2, hidden: true },
        [T_CARD_3.key]: T_CARD_3
      }) as any
    );

    store.dispatch(walletRestoreCards([T_CARD_2.key]));

    expect(store.getState().features.wallet.cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });
  });
});
