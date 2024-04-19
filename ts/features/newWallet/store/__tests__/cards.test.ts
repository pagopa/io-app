import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { WalletCard } from "../../types";
import {
  walletAddCards,
  walletRemoveCards,
  walletUpsertCard
} from "../actions/cards";
import {
  getWalletCardsCategorySelector,
  selectWalletCards
} from "../selectors";

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
    expect(globalState.features.wallet.cards).toStrictEqual(pot.noneLoading);
  });

  it("should add cards to the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

    const cards = pot.getOrElse(store.getState().features.wallet.cards, {});
    expect(cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    expect(selectWalletCards(store.getState())).toEqual(
      expect.arrayContaining([T_CARD_1, T_CARD_2, T_CARD_3])
    );

    expect(
      getWalletCardsCategorySelector("payment")(store.getState())
    ).toStrictEqual(expect.arrayContaining([T_CARD_2, T_CARD_3]));
  });

  it("should update a specific card in the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1]));

    const cards = pot.getOrElse(store.getState().features.wallet.cards, {});
    expect(cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1
    });

    store.dispatch(walletUpsertCard({ ...T_CARD_1, type: "cgn" }));

    const updatedCards = pot.getOrElse(
      store.getState().features.wallet.cards,
      {}
    );
    expect(updatedCards).toStrictEqual({
      [T_CARD_1.key]: { ...T_CARD_1, type: "cgn" }
    });
  });

  it("should add a card in the store if not present another with the same key", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1]));

    const cards = pot.getOrElse(store.getState().features.wallet.cards, {});
    expect(cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1
    });

    store.dispatch(walletUpsertCard(T_CARD_2));

    const updatedCards = pot.getOrElse(
      store.getState().features.wallet.cards,
      {}
    );
    expect(updatedCards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2
    });
  });

  it("should remove cards from the store", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

    const cards = pot.getOrElse(store.getState().features.wallet.cards, {});
    expect(cards).toStrictEqual({
      [T_CARD_1.key]: T_CARD_1,
      [T_CARD_2.key]: T_CARD_2,
      [T_CARD_3.key]: T_CARD_3
    });

    store.dispatch(walletRemoveCards([T_CARD_1.key, T_CARD_3.key]));

    const updatedCards = pot.getOrElse(
      store.getState().features.wallet.cards,
      {}
    );
    expect(updatedCards).toStrictEqual({
      [T_CARD_2.key]: T_CARD_2
    });
  });
});
