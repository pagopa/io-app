import { Option } from "fp-ts/lib/Option";
import { Wallet, CreditCard } from "../../../types/pagopa";
import {
  FETCH_WALLETS_REQUEST,
  SELECT_WALLET_FOR_DETAILS,
  SET_FAVORITE_WALLET,
  WALLETS_FETCHED,
  ADD_CREDIT_CARD_REQUEST
} from "../constants";

export type FetchWalletsRequest = Readonly<{
  type: typeof FETCH_WALLETS_REQUEST;
}>;

export type WalletsFetched = Readonly<{
  type: typeof WALLETS_FETCHED;
  payload: ReadonlyArray<Wallet>;
}>;

export type WalletSelectedForDetails = Readonly<{
  type: typeof SELECT_WALLET_FOR_DETAILS;
  payload: number;
}>;

export type SetFavoriteWallet = Readonly<{
  type: typeof SET_FAVORITE_WALLET;
  payload: Option<number>;
}>;

export type AddCreditCardRequest = Readonly<{
  type: typeof ADD_CREDIT_CARD_REQUEST;
  payload: CreditCard;
}>;

export type WalletsActions =
  | FetchWalletsRequest
  | WalletsFetched
  | WalletSelectedForDetails
  | SetFavoriteWallet
  | AddCreditCardRequest;

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

export const addCreditCardRequest = (
  card: CreditCard
): AddCreditCardRequest => ({
  type: ADD_CREDIT_CARD_REQUEST,
  payload: card
});
