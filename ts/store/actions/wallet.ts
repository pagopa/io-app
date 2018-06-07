
import { WalletTransaction } from "../../types/wallet";
import {
  TRANSACTIONS_FETCHED, FETCH_TRANSACTIONS_REQUEST
} from "../actions/constants";

export type TransactionsFetched = Readonly<{
  type: typeof TRANSACTIONS_FETCHED,
  payload: ReadonlyArray<WalletTransaction>
}>;

export type FetchTransactionsRequest = Readonly<{
  type: typeof FETCH_TRANSACTIONS_REQUEST
}>;

export type WalletActions = TransactionsFetched | FetchTransactionsRequest;

export const transactionsFetched = (transactions: ReadonlyArray<WalletTransaction>): TransactionsFetched => ({
  type: TRANSACTIONS_FETCHED,
  payload: transactions
});

export const fetchTransactionsRequest = (): FetchTransactionsRequest => ({
  type: FETCH_TRANSACTIONS_REQUEST
});