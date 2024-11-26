import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { WalletCard } from "../../../types";
import {
  walletAddCards,
  walletRemoveCards,
  walletRemoveCardsByType,
  walletUpsertCard
} from "../../actions/cards";
import { walletResetPlaceholders } from "../../actions/placeholders";

const mockCard: WalletCard = {
  key: "1",
  type: "payment",
  category: "payment",
  walletId: "12345"
};

describe("cards reducer", () => {
  it("should handle walletUpsertCard", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(walletUpsertCard(mockCard));

    expect(store.getState().features.wallet.cards).toEqual({
      "1": mockCard
    });
  });

  it("should handle walletAddCards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      walletAddCards([
        mockCard,
        {
          ...mockCard,
          key: "2",
          category: "bonus",
          walletId: "12"
        }
      ])
    );
    expect(store.getState().features.wallet.cards).toEqual({
      "1": mockCard,
      "2": {
        key: "2",
        type: "payment",
        category: "bonus",
        walletId: "12"
      }
    });
  });

  it("should handle walletRemoveCards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      walletAddCards([
        mockCard,
        {
          key: "2",
          type: "payment",
          category: "bonus",
          walletId: "12345"
        }
      ])
    );
    store.dispatch(walletRemoveCards(["1"]));
    expect(store.getState().features.wallet.cards).toEqual({
      "2": {
        key: "2",
        type: "payment",
        category: "bonus",
        walletId: "12345"
      }
    });
  });

  it("should handle walletResetPlaceholders", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(walletResetPlaceholders([mockCard]));
    expect(store.getState().features.wallet.cards).toEqual({
      "1": mockCard
    });
  });

  it("should handle walletRemoveCardsByType", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      walletAddCards([
        mockCard,
        {
          ...mockCard,
          key: "2"
        },
        {
          ...mockCard,
          key: "3"
        },
        {
          ...mockCard,
          key: "4"
        }
      ])
    );
    store.dispatch(walletRemoveCardsByType("payment"));
    expect(store.getState().features.wallet.cards).toEqual({});
  });
});
