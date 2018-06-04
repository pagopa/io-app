import { CreditCard } from "../../types/CreditCard";
import { WalletTransaction } from "../../types/wallet";
import {
  FETCH_TRANSACTIONS_REQUEST,
  LOAD_LATEST_TRANSACTIONS_LIST,
  LOAD_TRANSACTIONS_LIST_BY_SELECTED_CARD,
  SELECT_CARD,
  SHOW_TRANSACTION_DETAILS,
  TRANSACTIONS_FETCHED
} from "../actions/constants";

/**
 * Request a fetch of the transactions (this triggers
 * the fetchTransactions saga)
 */
export type FetchTransactionsRequest = Readonly<{
  type: typeof FETCH_TRANSACTIONS_REQUEST;
}>;

/**
 * The list of (all) transactions has been fetched via the API
 */
export type TransactionsFetched = Readonly<{
  type: typeof TRANSACTIONS_FETCHED;
  payload: ReadonlyArray<WalletTransaction>;
}>;

/**
 * a transaction's details are requested
 */
export type ShowTransactionDetails = Readonly<{
  type: typeof SHOW_TRANSACTION_DETAILS;
  payload: number;
}>;

/**
 * Requests loading in the store the list
 * of latest transactions
 */
export type LoadLatestTransactionsList = Readonly<{
  type: typeof LOAD_LATEST_TRANSACTIONS_LIST;
}>;

/**
 * A card has been selected for showing the transactions
 */
export type SelectCard = Readonly<{
  type: typeof SELECT_CARD;
  payload: number;
}>;

/**
 * Requests loading in the store the list of
 * transactions associated with a previously
 * selected credit card (already in the store)
 */
export type LoadTransactionsListBySelectedCard = Readonly<{
  type: typeof LOAD_TRANSACTIONS_LIST_BY_SELECTED_CARD;
}>;

export type WalletActions =
  | FetchTransactionsRequest
  | TransactionsFetched
  | ShowTransactionDetails
  | LoadLatestTransactionsList
  | SelectCard
  | LoadTransactionsListBySelectedCard;

export const fetchTransactionsRequest = (): FetchTransactionsRequest => ({
  type: FETCH_TRANSACTIONS_REQUEST
});

export const transactionsFetched = (
  transactions: ReadonlyArray<WalletTransaction>
): TransactionsFetched => ({
  type: TRANSACTIONS_FETCHED,
  payload: transactions
});

export const showTransactionDetails = (
  transaction: WalletTransaction
): ShowTransactionDetails => ({
  type: SHOW_TRANSACTION_DETAILS,
  payload: transaction.id
});

export const loadLatestTransactionsList = (): LoadLatestTransactionsList => ({
  type: LOAD_LATEST_TRANSACTIONS_LIST
});

export const selectCard = (card: CreditCard): SelectCard => ({
  type: SELECT_CARD,
  payload: card.id
});

export const loadTransactionsListBySelectedCard = (): LoadTransactionsListBySelectedCard => ({
  type: LOAD_TRANSACTIONS_LIST_BY_SELECTED_CARD
});
