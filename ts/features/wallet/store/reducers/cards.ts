import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCard } from "../../types";
import {
  walletAddCards,
  walletHideCards,
  walletRemoveCards,
  walletRemoveCardsByCategory,
  walletRemoveCardsByType,
  walletRestoreCards,
  walletUpsertCard
} from "../actions/cards";
import { walletResetPlaceholders } from "../actions/placeholders";

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

    case getType(walletAddCards):
      return action.payload.reduce((obj, card) => {
        if (card.type === "placeholder" && obj[card.key]) {
          // Do not ovveride card with a placeholder if already present
          return obj;
        }
        return {
          ...obj,
          [card.key]: card
        };
      }, state);

    case getType(walletRemoveCards):
      return Object.fromEntries(
        Object.entries(state).filter(([key]) => !action.payload.includes(key))
      );

    case getType(walletResetPlaceholders):
      return Object.fromEntries(
        Object.entries(state).filter(
          ([_key, card]) => card.type !== "placeholder"
        )
      );

    case getType(walletRemoveCardsByType):
      return Object.fromEntries(
        Object.entries(state).filter(([, { type }]) => type !== action.payload)
      );

    case getType(walletRemoveCardsByCategory):
      return Object.fromEntries(
        Object.entries(state).filter(
          ([, { category }]) => category !== action.payload
        )
      );

    case getType(walletHideCards):
      return Object.fromEntries(
        Object.entries(state).map(([key, card]) => {
          if (action.payload.includes(key)) {
            return [key, { ...card, hidden: true }];
          }
          return [key, card];
        })
      );

    case getType(walletRestoreCards):
      return Object.fromEntries(
        Object.entries(state).map(([key, card]) => {
          if (action.payload.includes(key)) {
            const { hidden, ...rest } = card;
            return [key, rest];
          }
          return [key, card];
        })
      );
  }
  return state;
};

export default reducer;
