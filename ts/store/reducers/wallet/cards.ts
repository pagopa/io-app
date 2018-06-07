import { none, Option, some } from "fp-ts/lib/Option";
import { CreditCard } from "../../../types/CreditCard";
import {
  CARDS_FETCHED,
  SELECT_CARD_FOR_DETAILS
} from "../../actions/constants";
import { Action } from "../../actions/types";

export type EmptyState = Readonly<{
  hasCards: boolean;
  hasCardSelectedForDetails: boolean;
}>;

export type WithCardsState = Readonly<{
  hasCards: true;
  cards: ReadonlyArray<CreditCard>;
}> &
  EmptyState;

export type WithSelectedCardState = Readonly<{
  hasCardSelectedForDetails: true;
  selectedCardId: number;
}> &
  WithCardsState;

export const CARDS_INITIAL_STATE: EmptyState = {
  hasCards: false,
  hasCardSelectedForDetails: false
};

export type CardsState = EmptyState | WithCardsState | WithSelectedCardState;

// type guards
export const hasCreditCards = (state: CardsState): state is WithCardsState =>
  state.hasCards;
export const hasCardSelectedForDetails = (
  state: CardsState
): state is WithSelectedCardState => state.hasCardSelectedForDetails;

// selectors
export const creditCardsSelector = (
  state: CardsState
): Option<ReadonlyArray<CreditCard>> => {
  if (hasCreditCards(state)) {
    return some(state.cards);
  }
  return none;
};

export const cardForDetailsSelector = (
  state: CardsState
): Option<CreditCard> => {
  if (hasCardSelectedForDetails(state)) {
    const card = state.cards.find(c => c.id === state.selectedCardId);
    if (card !== undefined) {
      return some(card);
    }
  }
  return none;
};

const reducer = (state: CardsState = CARDS_INITIAL_STATE, action: Action) => {
  if (action.type === CARDS_FETCHED) {
    return {
      ...state,
      hasCards: true,
      cards: action.payload
    };
  }
  if (action.type === SELECT_CARD_FOR_DETAILS && hasCreditCards(state)) {
    return {
      ...state,
      hasCardSelectedForDetails: true,
      selectedCardId: action.payload.id
    };
  }
  return state;
};

export default reducer;
