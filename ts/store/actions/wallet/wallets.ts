import { Option } from "fp-ts/lib/Option";
import { CreditCard, Wallet } from "../../../types/pagopa";
import {
  ADD_CREDIT_CARD_COMPLETED,
  ADD_CREDIT_CARD_REQUEST,
  CREDIT_CARD_DATA_CLEANUP,
  FETCH_WALLETS_REQUEST,
  SELECT_WALLET_FOR_DETAILS,
  SET_FAVORITE_WALLET,
  STORE_CREDIT_CARD_DATA,
  WALLETS_FETCHED
} from "../constants";

export type FetchWalletsRequest = Readonly<{
  type: typeof FETCH_WALLETS_REQUEST;
}>;

type WalletsFetched = Readonly<{
  type: typeof WALLETS_FETCHED;
  payload: ReadonlyArray<Wallet>;
}>;

type WalletSelectedForDetails = Readonly<{
  type: typeof SELECT_WALLET_FOR_DETAILS;
  payload: number;
}>;

type SetFavoriteWallet = Readonly<{
  type: typeof SET_FAVORITE_WALLET;
  payload: Option<number>;
}>;

export type AddCreditCardRequest = Readonly<{
  type: typeof ADD_CREDIT_CARD_REQUEST;
  payload: boolean; // <= should the card be set as the favorite payment method?
}>;

type StoreCreditCardData = Readonly<{
  type: typeof STORE_CREDIT_CARD_DATA;
  payload: CreditCard;
}>;

type CreditCardDataCleanup = Readonly<{
  type: typeof CREDIT_CARD_DATA_CLEANUP;
}>;

type AddCreditCardCompleted = Readonly<{
  type: typeof ADD_CREDIT_CARD_COMPLETED;
}>;

export type WalletsActions =
  | FetchWalletsRequest
  | WalletsFetched
  | WalletSelectedForDetails
  | SetFavoriteWallet
  | StoreCreditCardData
  | CreditCardDataCleanup
  | AddCreditCardRequest
  | AddCreditCardCompleted;

export const fetchWalletsRequest = (): FetchWalletsRequest => ({
  type: FETCH_WALLETS_REQUEST
});

export const walletsFetched = (
  wallets: ReadonlyArray<Wallet>
): WalletsFetched => ({
  type: WALLETS_FETCHED,
  payload: wallets
});

export const selectWalletForDetails = (
  walletId: number
): WalletSelectedForDetails => ({
  type: SELECT_WALLET_FOR_DETAILS,
  payload: walletId
});

export const setFavoriteWallet = (
  walletId: Option<number>
): SetFavoriteWallet => ({
  type: SET_FAVORITE_WALLET,
  payload: walletId
});

export const storeCreditCardData = (card: CreditCard): StoreCreditCardData => ({
  type: STORE_CREDIT_CARD_DATA,
  payload: card
});

export const creditCardDataCleanup = (): CreditCardDataCleanup => ({
  type: CREDIT_CARD_DATA_CLEANUP
});

export const addCreditCardRequest = (
  favorite: boolean
): AddCreditCardRequest => ({
  type: ADD_CREDIT_CARD_REQUEST,
  payload: favorite
});

export const addCreditCardCompleted = (): AddCreditCardCompleted => ({
  type: ADD_CREDIT_CARD_COMPLETED
});
