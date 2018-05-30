import { CreditCard } from "../../types/CreditCard";
import { WalletTransaction } from "../../types/wallet";
import {
  LOAD_LATEST_TRANSACTIONS,
  LOAD_TRANSACTIONS_BY_SELECTED_CARD,
  LOAD_TRANSACTIONS_REQUEST,
  SELECT_CARD,
  TRANSACTION_SELECTED,
  TRANSACTIONS_LOADED
} from "../actions/constants"; // TODO add

export type TransactionSelected = Readonly<{
  type: typeof TRANSACTION_SELECTED;
  payload: number;
}>;

export type LoadTransactions = Readonly<{
  type: typeof TRANSACTIONS_LOADED;
  payload: ReadonlyArray<WalletTransaction>;
}>;

export type LoadLatestTransactions = Readonly<{
  type: typeof LOAD_LATEST_TRANSACTIONS;
}>;

export type LoadTransactionsRequest = Readonly<{
  type: typeof LOAD_TRANSACTIONS_REQUEST;
}>;

export type SelectCard = Readonly<{
  type: typeof SELECT_CARD;
  payload: number;
}>;

export type LoadTransactionsBySelectedCard = Readonly<{
  type: typeof LOAD_TRANSACTIONS_BY_SELECTED_CARD;
}>;

export type WalletActions =
  | TransactionSelected
  | LoadTransactions
  | LoadLatestTransactions
  | SelectCard
  | LoadTransactionsBySelectedCard;

export const transactionSelected = (
  transaction: WalletTransaction
): TransactionSelected => ({
  type: TRANSACTION_SELECTED,
  payload: transaction.id
});

export const loadTransactionsRequest = (): LoadTransactionsRequest => ({
  type: LOAD_TRANSACTIONS_REQUEST
});

export const loadLatestTransactions = (): LoadLatestTransactions => ({
  type: LOAD_LATEST_TRANSACTIONS
});

export const loadTransactionsBySelectedCard = (): LoadTransactionsBySelectedCard => ({
  type: LOAD_TRANSACTIONS_BY_SELECTED_CARD
});

export const transactionsLoaded = (
  transactions: ReadonlyArray<WalletTransaction>
): LoadTransactions => ({
  type: TRANSACTIONS_LOADED,
  payload: transactions
});

export const selectCard = (card: CreditCard): SelectCard => ({
  type: SELECT_CARD,
  payload: card.id
});
