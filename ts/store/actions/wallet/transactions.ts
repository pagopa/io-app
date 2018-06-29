import { WalletTransaction } from "../../../types/wallet";
import {
  FETCH_TRANSACTIONS_REQUEST,
  SELECT_TRANSACTION_FOR_DETAILS,
  TRANSACTION_ERROR,
  TRANSACTIONS_FETCHED
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

export type TransactionError = Readonly<{
  type: typeof TRANSACTION_ERROR;
  error: Error;
}>;

export type TransactionsActions =
  | TransactionsFetched
  | FetchTransactionsRequest
  | SelectTransactionForDetails
  | TransactionError;

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
