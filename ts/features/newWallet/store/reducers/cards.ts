import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCard } from "../../types";
import {
  walletAddCards,
  walletRemoveCard,
  walletRemoveCards,
  walletUpsertCard
} from "../actions/cards";

export type WalletCardsState = { [key: string]: WalletCard };

const INITIAL_STATE: WalletCardsState = {};

const reducer = (
  state: WalletCardsState = INITIAL_STATE,
  action: Action
): WalletCardsState => {
  switch (action.type) {
    case getType(walletUpsertCard):
      return {
        ...state,
        [action.payload.key]: action.payload
      };

    case getType(walletAddCards): {
      return action.payload.reduce(
        (obj, card) => ({
          ...obj,
          [card.key]: card
        }),
        state
      );
    }

    case getType(walletRemoveCard): {
      const { [action.payload]: WalletCard, ...cards } = state;
      return cards;
    }

    case getType(walletRemoveCards): {
      return Object.fromEntries(
        Object.entries(state).filter(([key]) => !action.payload.includes(key))
      );
    }
  }
  return state;
};

export default reducer;
