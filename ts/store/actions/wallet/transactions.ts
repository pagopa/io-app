import { Function1, Lazy, Predicate } from "fp-ts/lib/function";
import { ActionType, createStandardAction } from "typesafe-actions";

import { Transaction } from "../../../types/pagopa";

//
// fetch all transactions
//

export const fetchTransactionsRequest = createStandardAction(
  "FETCH_TRANSACTIONS_REQUEST"
)();

export const fetchTransactionsSuccess = createStandardAction(
  "FETCH_TRANSACTIONS_SUCCESS"
)<ReadonlyArray<Transaction>>();

export const fetchTransactionsFailure = createStandardAction(
  "FETCH_TRANSACTIONS_FAILURE"
)<Error>();

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
  | ActionType<typeof fetchTransactionsSuccess>
  | ActionType<typeof fetchTransactionsRequest>
  | ActionType<typeof fetchTransactionsFailure>
  | ActionType<typeof fetchTransactionSuccess>
  | ActionType<typeof fetchTransactionRequest>
  | ActionType<typeof fetchTransactionFailure>
  | ActionType<typeof runPollTransactionSaga>
  | ActionType<typeof pollTransactionSagaCompleted>
  | ActionType<typeof pollTransactionSagaTimeout>;
