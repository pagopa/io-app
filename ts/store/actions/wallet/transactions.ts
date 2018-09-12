import { Transaction } from "../../../types/pagopa";
import {
  FETCH_TRANSACTIONS_REQUEST,
  PAYMENT_STORE_NEW_TRANSACTION,
  SELECT_TRANSACTION_FOR_DETAILS,
  TRANSACTIONS_FETCHED
} from "../../actions/constants";

type TransactionsFetched = Readonly<{
  type: typeof TRANSACTIONS_FETCHED;
  payload: ReadonlyArray<Transaction>;
}>;

type FetchTransactionsRequest = Readonly<{
  type: typeof FETCH_TRANSACTIONS_REQUEST;
}>;

type SelectTransactionForDetails = Readonly<{
  type: typeof SELECT_TRANSACTION_FOR_DETAILS;
  payload: Transaction;
}>;

type StoreNewTransaction = Readonly<{
  type: typeof PAYMENT_STORE_NEW_TRANSACTION;
  payload: Transaction;
}>;

export type TransactionsActions =
  | TransactionsFetched
  | FetchTransactionsRequest
  | SelectTransactionForDetails
  | StoreNewTransaction;

export const transactionsFetched = (
  transactions: ReadonlyArray<Transaction>
): TransactionsFetched => ({
  type: TRANSACTIONS_FETCHED,
  payload: transactions
});

export const fetchTransactionsRequest = (): FetchTransactionsRequest => ({
  type: FETCH_TRANSACTIONS_REQUEST
});

export const selectTransactionForDetails = (
  transaction: Transaction
): SelectTransactionForDetails => ({
  type: SELECT_TRANSACTION_FOR_DETAILS,
  payload: transaction
});
