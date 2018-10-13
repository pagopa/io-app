import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { Transaction } from "../../../types/pagopa";

export type TransactionsActions =
  | ActionType<typeof fetchTransactionsSuccess>
  | ActionType<typeof fetchTransactionsRequest>
  | ActionType<typeof storeNewTransaction>
  | ActionType<typeof fetchTransactionsFailure>;

export const fetchTransactionsSuccess = createAction(
  "FETCH_TRANSACTIONS_SUCCESS",
  resolve => (transactions: ReadonlyArray<Transaction>) => resolve(transactions)
);

export const fetchTransactionsFailure = createAction(
  "FETCH_TRANSACTIONS_FAILURE",
  resolve => (error: Error) => resolve(error)
);

export const fetchTransactionsRequest = createStandardAction(
  "FETCH_TRANSACTIONS_REQUEST"
)();

export const storeNewTransaction = createAction(
  "PAYMENT_STORE_NEW_TRANSACTION",
  resolve => (transaction: Transaction) => resolve(transaction)
);
