import { Option } from "fp-ts/lib/Option";
import { CreditCard, CreditCardId } from "../../../types/CreditCard";
import {
  CARDS_FETCHED,
  FETCH_CARDS_REQUEST,
  SELECT_CARD_FOR_DETAILS,
  SET_FAVORITE_CARD,
  ADD_CARD_REQUEST,
  STORE_NEW_CARD_DATA
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
  payload: CreditCardId;
}>;

export type SetFavoriteCard = Readonly<{
  type: typeof SET_FAVORITE_CARD;
  payload: Option<CreditCardId>;
}>;

export type StoreNewCardData = Readonly<{
  type: typeof STORE_NEW_CARD_DATA;
  payload: CreditCard;
}>;

export type AddCardRequest = Readonly<{
  type: typeof ADD_CARD_REQUEST;
}>;

export type CardsActions =
  | FetchCardsRequest
  | CardsFetched
  | CardSelectedForDetails
  | SetFavoriteCard
  | StoreNewCardData
  | AddCardRequest;

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
  card: CreditCardId
): CardSelectedForDetails => ({
  type: SELECT_CARD_FOR_DETAILS,
  payload: card
});

export const setFavoriteCard = (
  cardId: Option<CreditCardId>
): SetFavoriteCard => ({
  type: SET_FAVORITE_CARD,
  payload: cardId
});

export const storeNewCardData = (card: CreditCard): StoreNewCardData => ({
  type: STORE_NEW_CARD_DATA,
  payload: card
});

export const addCardRequest = (): AddCardRequest => ({
  type: ADD_CARD_REQUEST
});
