import { Function1, Lazy, Predicate } from "fp-ts/lib/function";
import { Option } from "fp-ts/lib/Option";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Psp, Transaction } from "../../../types/pagopa";

//
// fetch all transactions
//

export const fetchTransactionsRequest = createStandardAction(
  "FETCH_TRANSACTIONS_REQUEST"
)<{ start: number }>();

export const fetchTransactionsSuccess = createStandardAction(
  "FETCH_TRANSACTIONS_SUCCESS"
)<{ data: ReadonlyArray<Transaction>; size: Option<number> }>();

export const fetchTransactionsFailure = createStandardAction(
  "FETCH_TRANSACTIONS_FAILURE"
)<Error>();

export const readTransaction = createStandardAction("READ_TRANSACTION")<
  Transaction
>();

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

//
// poll for a transaction until it reaches a certain state
//

type RunPollTransactionSagaPayload = Readonly<{
  id: number;
  isValid: Predicate<Transaction>;
  onValid?: Function1<Transaction, void>;
  onTimeout?: Lazy<void>;
}>;

export const runPollTransactionSaga = createStandardAction(
  "POLL_TRANSACTION_SAGA_RUN"
)<RunPollTransactionSagaPayload>();

export const pollTransactionSagaCompleted = createStandardAction(
  "POLL_TRANSACTION_SAGA_COMPLETED"
)<Transaction>();

export const pollTransactionSagaTimeout = createStandardAction(
  "POLL_TRANSACTION_SAGA_TIMEOUT"
)();

export type TransactionsActions =
  | ActionType<typeof readTransaction>
  | ActionType<typeof fetchTransactionsSuccess>
  | ActionType<typeof fetchTransactionsRequest>
  | ActionType<typeof fetchTransactionsFailure>
  | ActionType<typeof fetchTransactionSuccess>
  | ActionType<typeof fetchTransactionRequest>
  | ActionType<typeof fetchTransactionFailure>
  | ActionType<typeof fetchPsp>
  | ActionType<typeof runPollTransactionSaga>
  | ActionType<typeof pollTransactionSagaCompleted>
  | ActionType<typeof pollTransactionSagaTimeout>;
