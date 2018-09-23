import { Transaction } from "../../../types/pagopa";
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  PAYMENT_STORE_NEW_TRANSACTION,
  SELECT_TRANSACTION_FOR_DETAILS
} from "../../actions/constants";

type FetchTransactionsSuccess = Readonly<{
  type: typeof FETCH_TRANSACTIONS_SUCCESS;
  payload: ReadonlyArray<Transaction>;
}>;

export type FetchTransactionsRequest = Readonly<{
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
  | FetchTransactionsSuccess
  | FetchTransactionsRequest
  | SelectTransactionForDetails
  | StoreNewTransaction;

export const fetchTransactionsSuccess = (
  transactions: ReadonlyArray<Transaction>
): FetchTransactionsSuccess => ({
  type: FETCH_TRANSACTIONS_SUCCESS,
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
