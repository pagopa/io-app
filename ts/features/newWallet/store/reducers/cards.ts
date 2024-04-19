import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCard } from "../../types";
import {
  walletAddCards,
  walletRemoveCards,
  walletUpsertCard
} from "../actions/cards";

export type WalletCards = { [key: string]: WalletCard };

export type WalletCardsState = pot.Pot<WalletCards, Error>;

const INITIAL_STATE: WalletCardsState = pot.noneLoading;

const reducer = (
  state: WalletCardsState = INITIAL_STATE,
  action: Action
): WalletCardsState => {
  switch (action.type) {
    case getType(walletUpsertCard): {
      const cards = pot.getOrElse(state, {});
      const updatedCards = {
        ...cards,
        [action.payload.key]: action.payload
      };
      return pot.some(updatedCards);
    }

    case getType(walletAddCards): {
      const cards = pot.getOrElse(state, {});
      const updatedCards = action.payload.reduce(
        (obj, card) => ({
          ...obj,
          [card.key]: card
        }),
        cards
      );
      return pot.some(updatedCards);
    }

    case getType(walletRemoveCards): {
      const cards = pot.getOrElse(state, {});
      const updatedCards = Object.fromEntries(
        Object.entries(cards).filter(([key]) => !action.payload.includes(key))
      );
      return pot.some(updatedCards);
    }
  }
  return state;
};

export default reducer;
