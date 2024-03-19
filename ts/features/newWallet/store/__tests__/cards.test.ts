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
  getWalletCardsByCategorySelector,
  selectWalletCards
} from "../selectors";

const T_CARD_1: WalletCard = {
  category: "bonus",
  key: "1234",
  type: "idPay"
};
const T_CARD_2: WalletCard = {
  category: "payment",
  key: "9999",
  type: "payment"
};
const T_CARD_3: WalletCard = {
  category: "payment",
  key: "4444",
  type: "payment"
};

describe("Wallet store", () => {
  describe("reducer", () => {
    it("should start with initial state", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.features.wallet.cards).toStrictEqual({});
    });

    it("should add cards to the store", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.features.wallet.cards).toStrictEqual({});

      const store = createStore(appReducer, globalState as any);

      store.dispatch(walletAddCards([T_CARD_1, T_CARD_2]));

      expect(store.getState().features.wallet.cards).toEqual({
        [T_CARD_1.key]: T_CARD_1,
        [T_CARD_2.key]: T_CARD_2
      });
    });

    it("should update a specific card in the store", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.features.wallet.cards).toStrictEqual({});

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
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.features.wallet.cards).toStrictEqual({});

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
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.features.wallet.cards).toStrictEqual({});

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
  });
  describe("selectors", () => {
    it("should get all the cards from the wallet", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.features.wallet.cards).toStrictEqual({});

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

    it("should get all wallet cards for a specific category", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.features.wallet.cards).toStrictEqual({});

      const store = createStore(appReducer, globalState as any);

      store.dispatch(walletAddCards([T_CARD_1, T_CARD_2, T_CARD_3]));

      expect(store.getState().features.wallet.cards).toStrictEqual({
        [T_CARD_1.key]: T_CARD_1,
        [T_CARD_2.key]: T_CARD_2,
        [T_CARD_3.key]: T_CARD_3
      });

      expect(
        getWalletCardsByCategorySelector("payment")(store.getState())
      ).toStrictEqual(expect.arrayContaining([T_CARD_2, T_CARD_3]));
    });
  });
});
