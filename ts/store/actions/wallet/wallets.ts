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
  WALLET_MANAGEMENT_RESET_LOADING_STATE,
  WALLET_MANAGEMENT_SET_LOADING_STATE,
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
  creditCard: CreditCard;
  // should the card be set as the favorite payment method?
  setAsFavorite: boolean;
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

export type WalletManagementSetLoadingState = Readonly<{
  type: typeof WALLET_MANAGEMENT_SET_LOADING_STATE;
}>;

export type WalletManagementResetLoadingState = Readonly<{
  type: typeof WALLET_MANAGEMENT_RESET_LOADING_STATE;
}>;

export type WalletsActions =
  | FetchWalletsRequest
  | WalletsFetched
  | WalletSelectedForDetails
  | SetFavoriteWallet
  | StoreCreditCardData
  | CreditCardDataCleanup
  | AddCreditCardRequest
  | AddCreditCardCompleted
  | WalletManagementSetLoadingState
  | WalletManagementResetLoadingState;

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
  creditCard: CreditCard,
  setAsFavorite: boolean
): AddCreditCardRequest => ({
  type: ADD_CREDIT_CARD_REQUEST,
  creditCard,
  setAsFavorite
});

export const addCreditCardCompleted = (): AddCreditCardCompleted => ({
  type: ADD_CREDIT_CARD_COMPLETED
});

export const walletManagementSetLoadingState = (): WalletManagementSetLoadingState => ({
  type: WALLET_MANAGEMENT_SET_LOADING_STATE
});

export const walletManagementResetLoadingState = (): WalletManagementResetLoadingState => ({
  type: WALLET_MANAGEMENT_RESET_LOADING_STATE
});
