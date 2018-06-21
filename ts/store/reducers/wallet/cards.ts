/**
 * Reducers, states, selectors and guards for the cards
 */
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import _ from "lodash";
import { createSelector } from "reselect";
import { CreditCard } from "../../../types/CreditCard";
import {
  CARDS_FETCHED,
  SELECT_CARD_FOR_DETAILS
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type CardsState = Readonly<{
  cards: IndexedById<CreditCard>;
  selectedCardId: Option<number>;
}>;

export const CARDS_INITIAL_STATE: CardsState = {
  cards: {},
  selectedCardId: none
};

// selectors
export const getCards = (state: GlobalState) => state.wallet.cards.cards;
export const getSelectedCreditCardId = (state: GlobalState) =>
  state.wallet.cards.selectedCardId;

export const creditCardsSelector = createSelector(
  getCards,
  // define whether an order among cards needs to be established
  // (e.g. by insertion date, expiration date, ...)
  (cards: IndexedById<CreditCard>): ReadonlyArray<CreditCard> => _.values(cards)
);

export const creditCardIdsSelector = createSelector(
  getCards,
  (cards: IndexedById<CreditCard>): ReadonlyArray<number> =>
    _.values(cards).map(c => c.id) // not using _.keys as it returns a string[]
);

export const selectedCreditCardSelector = createSelector(
  getSelectedCreditCardId,
  getCards,
  (
    cardId: Option<number>,
    cards: IndexedById<CreditCard>
  ): Option<CreditCard> => {
    if (cardId.isNone()) {
      return none;
    }
    return fromNullable(_.values(cards).find(c => c.id === cardId.value));
  }
);

// reducer
const reducer = (
  state: CardsState = CARDS_INITIAL_STATE,
  action: Action
): CardsState => {
  if (action.type === CARDS_FETCHED) {
    return {
      ...state,
      cards: toIndexed(action.payload)
    };
  }
  if (action.type === SELECT_CARD_FOR_DETAILS) {
    return {
      ...state,
      selectedCardId: some(
        typeof action.payload === "number" ? action.payload : action.payload.id
      )
    };
  }
  return state;
};

export default reducer;
