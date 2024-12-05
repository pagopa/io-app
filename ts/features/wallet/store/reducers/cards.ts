import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCard } from "../../types";
import {
  walletAddCards,
  walletRemoveCards,
  walletRemoveCardsByType,
  walletUpsertCard
} from "../actions/cards";
import { walletResetPlaceholders } from "../actions/placeholders";
import { paymentsDeleteMethodAction } from "../../../payments/details/store/actions";
import { mapWalletIdToCardKey } from "../../../payments/common/utils";

type DeletedCard = WalletCard & { index: number };

export type WalletCardsState = {
  [key: string]: WalletCard;
} & {
  deletedCard?: DeletedCard;
};

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
      return action.payload.reduce(
        (obj, card) => ({
          ...obj,
          [card.key]: card
        }),
        state
      );

    case getType(walletRemoveCards):
      return Object.fromEntries(
        Object.entries(state).filter(([key]) => !action.payload.includes(key))
      );

    case getType(walletResetPlaceholders):
      return Object.fromEntries(
        Object.entries(state).filter(([_, card]) => card.type !== "placeholder")
      );

    case getType(walletRemoveCardsByType):
      return Object.fromEntries(
        Object.entries(state).filter(([, { type }]) => type !== action.payload)
      );

    case getType(paymentsDeleteMethodAction.request): {
      const cardKey = mapWalletIdToCardKey(action.payload.walletId);
      const deletedCard = {
        ...state[cardKey],
        index: Object.keys(state).indexOf(cardKey)
      };

      const newState = Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== cardKey)
      );

      return {
        ...newState,
        deletedCard
      };
    }

    case getType(paymentsDeleteMethodAction.cancel):
    case getType(paymentsDeleteMethodAction.failure): {
      if (!state.deletedCard) {
        return state; // No deletedCard to restore
      }

      const { deletedCard, ...rest } = state;
      // Reconstruct state with deletedCard in its original position
      const restoredEntries = [
        ...Object.entries(rest).slice(0, deletedCard.index),
        [deletedCard.key, deletedCard],
        ...Object.entries(rest).slice(deletedCard.index)
      ];

      return Object.fromEntries(restoredEntries);
    }
  }
  return state;
};

export default reducer;
