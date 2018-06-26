import { Option } from "fp-ts/lib/Option";
import { CreditCard } from "../../../types/CreditCard";
import {
  CARDS_FETCHED,
  FETCH_CARDS_REQUEST,
  SELECT_CARD_FOR_DETAILS,
  SET_FAVORITE_CARD
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
  payload: CreditCard | number; // either a card or its id
}>;

export type SetFavoriteCard = Readonly<{
  type: typeof SET_FAVORITE_CARD;
  payload: Option<number>;
}>;

export type CardsActions =
  | FetchCardsRequest
  | CardsFetched
  | CardSelectedForDetails
  | SetFavoriteCard;

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
  card: CreditCard | number
): CardSelectedForDetails => ({
  type: SELECT_CARD_FOR_DETAILS,
  payload: card
});

export const setFavoriteCard = (cardId: Option<number>): SetFavoriteCard => ({
  type: SET_FAVORITE_CARD,
  payload: cardId
});
