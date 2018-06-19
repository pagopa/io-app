import { CreditCard } from "../../../types/CreditCard";
import {
  CARDS_FETCHED,
  FETCH_CARDS_REQUEST,
  SELECT_CARD_FOR_DETAILS
} from "../constants";

export type FetchCardsRequest = Readonly<{
  type: typeof FETCH_CARDS_REQUEST;
}>;

export type CardsFetched = Readonly<{
  type: typeof CARDS_FETCHED;
  payload: ReadonlyArray<CreditCard>;
}>;

export type CardSelectedForDetails = Readonly<{
  type: typeof SELECT_CARD_FOR_DETAILS;
  payload: CreditCard;
}>;

export type CardsActions =
  | FetchCardsRequest
  | CardsFetched
  | CardSelectedForDetails;

export const fetchCardsRequest = (): FetchCardsRequest => ({
  type: FETCH_CARDS_REQUEST
});

export const cardsFetched = (
  cards: ReadonlyArray<CreditCard>
): CardsFetched => ({
  type: CARDS_FETCHED,
  payload: cards
});

export const selectCardForDetails = (
  card: CreditCard
): CardSelectedForDetails => ({
  type: SELECT_CARD_FOR_DETAILS,
  payload: card
});
