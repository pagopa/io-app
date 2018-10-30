import { ActionType, createStandardAction } from "typesafe-actions";

import {
  CreditCard,
  NullableWallet,
  PaymentManagerToken,
  PayRequest,
  Transaction,
  TransactionResponse,
  Wallet,
  WalletResponse
} from "../../../types/pagopa";
import { PayloadForAction } from "../../../types/utils";

export const fetchWalletsRequest = createStandardAction(
  "FETCH_WALLETS_REQUEST"
)();

export const fetchWalletsSuccess = createStandardAction(
  "FETCH_WALLETS_SUCCESS"
)<ReadonlyArray<Wallet>>();

export const fetchWalletsFailure = createStandardAction(
  "FETCH_WALLETS_FAILURE"
)<Error>();

export const addWalletCreditCardInit = createStandardAction(
  "ADD_WALLET_CREDITCARD_INIT"
)();

type AddWalletCreditCardRequestPayload = Readonly<{
  creditcard: NullableWallet;
}>;

export const addWalletCreditCardRequest = createStandardAction(
  "ADD_WALLET_CREDITCARD_REQUEST"
)<AddWalletCreditCardRequestPayload>();

export const addWalletCreditCardSuccess = createStandardAction(
  "ADD_WALLET_CREDITCARD_SUCCESS"
)<WalletResponse>();

export const addWalletCreditCardFailure = createStandardAction(
  "ADD_WALLET_CREDITCARD_FAILURE"
)<"GENERIC_ERROR" | "ALREADY_EXISTS">();

type PayCreditCardVerificationRequestPayload = Readonly<{
  payRequest: PayRequest;
  language?: string;
}>;

export const payCreditCardVerificationRequest = createStandardAction(
  "PAY_CREDITCARD_VERIFICATION_REQUEST"
)<PayCreditCardVerificationRequestPayload>();

export const payCreditCardVerificationSuccess = createStandardAction(
  "PAY_CREDITCARD_VERIFICATION_SUCCESS"
)<TransactionResponse>();

export const payCreditCardVerificationFailure = createStandardAction(
  "PAY_CREDITCARD_VERIFICATION_FAILURE"
)<Error>();

type CreditCardCheckout3dsRequestPayload = Readonly<{
  urlCheckout3ds: string;
  paymentManagerToken: PaymentManagerToken;
}>;

export const creditCardCheckout3dsRequest = createStandardAction(
  "CREDITCARD_CHECKOUT_3DS_REQUEST"
)<CreditCardCheckout3dsRequestPayload>();

export const creditCardCheckout3dsComplete = createStandardAction(
  "CREDITCARD_CHECKOUT_3DS_COMPLETE"
)<number | undefined>();

export const fetchCreditCardCheckout3dsTransactionRequest = createStandardAction(
  "FETCH_CREDITCARD_CHECKOUT_3DS_TRANSACTION_REQUEST"
)<number>();

export const fetchCreditCardCheckout3dsTransactionSuccess = createStandardAction(
  "FETCH_CREDITCARD_CHECKOUT_3DS_TRANSACTION_SUCCESS"
)<Transaction>();

export const fetchCreditCardCheckout3dsTransactionFailure = createStandardAction(
  "FETCH_CREDITCARD_CHECKOUT_3DS_TRANSACTION_FAILURE"
)<Error>();

export const fetchCreditCardUpdatedWalletRequest = createStandardAction(
  "FETCH_CREDITCARD_UPDATED_WALLET_REQUEST"
)<number>();

export const fetchCreditCardUpdatedWalletSuccess = createStandardAction(
  "FETCH_CREDITCARD_UPDATED_WALLET_SUCCESS"
)<Wallet>();

export const fetchCreditCardUpdatedWalletFailure = createStandardAction(
  "FETCH_CREDITCARD_UPDATED_WALLET_FAILURE"
)<"NOT_FOUND" | "GENERIC_ERROR">();

type DeleteWalletRequestPayload = Readonly<{
  walletId: number;
  onSuccess?: (action: ActionType<typeof deleteWalletSuccess>) => void;
  onFailure?: (action: ActionType<typeof deleteWalletFailure>) => void;
}>;

export const deleteWalletRequest = createStandardAction(
  "DELETE_WALLET_REQUEST"
)<DeleteWalletRequestPayload>();

export const deleteWalletSuccess = createStandardAction(
  "DELETE_WALLET_SUCCESS"
)<PayloadForAction<typeof fetchWalletsSuccess>>();

export const deleteWalletFailure = createStandardAction(
  "DELETE_WALLET_FAILURE"
)<PayloadForAction<typeof fetchWalletsFailure>>();

export const setFavouriteWalletRequest = createStandardAction(
  "SET_FAVOURITE_WALLET_REQUEST"
)<number | undefined>();

export const setFavouriteWalletSuccess = createStandardAction(
  "SET_FAVOURITE_WALLET_SUCCESS"
)<Wallet>();

export const setFavouriteWalletFailure = createStandardAction(
  "SET_FAVOURITE_WALLET_FAILURE"
)<Error>();

type StartOrResumeAddCreditCardSagaPayload = Readonly<{
  creditCard: CreditCard;
  language?: string;
  setAsFavorite: boolean;
  onSuccess?: (wallet: Wallet) => void;
  onFailure?: (error?: "ALREADY_EXISTS") => void;
}>;

export const runStartOrResumeAddCreditCardSaga = createStandardAction(
  "RUN_ADD_CREDIT_CARD_SAGA"
)<StartOrResumeAddCreditCardSagaPayload>();

export type WalletsActions =
  | ActionType<typeof fetchWalletsRequest>
  | ActionType<typeof fetchWalletsSuccess>
  | ActionType<typeof fetchWalletsFailure>
  | ActionType<typeof deleteWalletRequest>
  | ActionType<typeof deleteWalletSuccess>
  | ActionType<typeof deleteWalletFailure>
  | ActionType<typeof setFavouriteWalletRequest>
  | ActionType<typeof setFavouriteWalletSuccess>
  | ActionType<typeof setFavouriteWalletFailure>
  | ActionType<typeof runStartOrResumeAddCreditCardSaga>
  | ActionType<typeof addWalletCreditCardInit>
  | ActionType<typeof addWalletCreditCardRequest>
  | ActionType<typeof addWalletCreditCardSuccess>
  | ActionType<typeof addWalletCreditCardFailure>
  | ActionType<typeof payCreditCardVerificationRequest>
  | ActionType<typeof payCreditCardVerificationSuccess>
  | ActionType<typeof payCreditCardVerificationFailure>
  | ActionType<typeof creditCardCheckout3dsRequest>
  | ActionType<typeof creditCardCheckout3dsComplete>
  | ActionType<typeof fetchCreditCardCheckout3dsTransactionRequest>
  | ActionType<typeof fetchCreditCardCheckout3dsTransactionSuccess>
  | ActionType<typeof fetchCreditCardCheckout3dsTransactionFailure>
  | ActionType<typeof fetchCreditCardUpdatedWalletRequest>
  | ActionType<typeof fetchCreditCardUpdatedWalletSuccess>
  | ActionType<typeof fetchCreditCardUpdatedWalletFailure>;
