import { WalletTransaction } from "../../../types/wallet";
import {
  FETCH_TRANSACTIONS_REQUEST,
  SELECT_TRANSACTION_FOR_DETAILS,
  TRANSACTIONS_FETCHED,
  PAYMENT_STORE_NEW_TRANSACTION
} from "../../actions/constants";

export type TransactionsFetched = Readonly<{
  type: typeof TRANSACTIONS_FETCHED;
  payload: ReadonlyArray<WalletTransaction>;
}>;

export type FetchTransactionsRequest = Readonly<{
  type: typeof FETCH_TRANSACTIONS_REQUEST;
}>;

export type SelectTransactionForDetails = Readonly<{
  type: typeof SELECT_TRANSACTION_FOR_DETAILS;
  payload: WalletTransaction;
}>;

export type StoreNewTransaction = Readonly<{
  type: typeof PAYMENT_STORE_NEW_TRANSACTION;
  payload: WalletTransaction;
}>;

export type TransactionsActions =
  | TransactionsFetched
  | FetchTransactionsRequest
  | SelectTransactionForDetails
  | StoreNewTransaction;

export const transactionsFetched = (
  transactions: ReadonlyArray<WalletTransaction>
): TransactionsFetched => ({
  type: TRANSACTIONS_FETCHED,
  payload: transactions
});

export const fetchTransactionsRequest = (): FetchTransactionsRequest => ({
  type: FETCH_TRANSACTIONS_REQUEST
});

export const selectTransactionForDetails = (
  transaction: WalletTransaction
): SelectTransactionForDetails => ({
  type: SELECT_TRANSACTION_FOR_DETAILS,
  payload: transaction
});

export const storeNewTransaction = (transaction: WalletTransaction) => ({
  type: PAYMENT_STORE_NEW_TRANSACTION,
  payload: transaction
});
