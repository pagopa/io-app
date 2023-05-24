import * as O from "fp-ts/lib/Option";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Psp, Transaction } from "../../../types/pagopa";

//
// fetch all transactions
//

// transactions is a pagination API. Request payload includes start to specify from which
// item we want to load
export const fetchTransactionsRequest = createStandardAction(
  "FETCH_TRANSACTIONS_REQUEST"
)<{ start: number }>();

// this action load transaction following a backoff retry strategy
export const fetchTransactionsRequestWithExpBackoff = createStandardAction(
  "FETCH_TRANSACTIONS_BACKOFF_REQUEST"
)<{ start: number }>();

// transactions is a pagination API. Success payload includes 'total' to know how many
// transactions are available
export const fetchTransactionsSuccess = createStandardAction(
  "FETCH_TRANSACTIONS_SUCCESS"
)<{ data: ReadonlyArray<Transaction>; total: O.Option<number> }>();

// on transactions refresh all stored transactions are cleared
export const clearTransactions =
  createStandardAction("CLEAR_TRANSACTIONS")<void>();

export const fetchTransactionsFailure = createStandardAction(
  "FETCH_TRANSACTIONS_FAILURE"
)<Error>();

// notify all transactions are been fully loaded
export const fetchTransactionsLoadComplete = createStandardAction(
  "FETCH_TRANSACTION_LOAD_COMPLETE"
)<ReadonlyArray<Transaction>>();

//
// fetch a single transaction
//
export const fetchTransactionRequest = createStandardAction(
  "FETCH_TRANSACTION_REQUEST"
)<number>();

export const fetchTransactionSuccess = createStandardAction(
  "FETCH_TRANSACTION_SUCCESS"
)<Transaction>();

export const fetchTransactionFailure = createStandardAction(
  "FETCH_TRANSACTION_FAILURE"
)<Error>();

//
// fetch a single psp
//

type FetchPspRequestPayload = Readonly<{
  idPsp: number;
  onSuccess?: (action: ActionType<typeof fetchPsp["success"]>) => void;
  onFailure?: (action: ActionType<typeof fetchPsp["failure"]>) => void;
}>;

type FetchPspSuccessPayload = Readonly<{
  idPsp: number;
  psp: Psp;
}>;

type FetchPspFailurePayload = Readonly<{
  idPsp: number;
  error: Error;
}>;

export const fetchPsp = createAsyncAction(
  "FETCH_PSP_REQUEST",
  "FETCH_PSP_SUCCESS",
  "FETCH_PSP_FAILURE"
)<FetchPspRequestPayload, FetchPspSuccessPayload, FetchPspFailurePayload>();

export type TransactionsActions =
  | ActionType<typeof fetchTransactionsSuccess>
  | ActionType<typeof fetchTransactionsRequest>
  | ActionType<typeof fetchTransactionsFailure>
  | ActionType<typeof fetchTransactionSuccess>
  | ActionType<typeof fetchTransactionRequest>
  | ActionType<typeof fetchTransactionFailure>
  | ActionType<typeof fetchPsp>
  | ActionType<typeof clearTransactions>
  | ActionType<typeof fetchTransactionsLoadComplete>
  | ActionType<typeof fetchTransactionsRequestWithExpBackoff>;
