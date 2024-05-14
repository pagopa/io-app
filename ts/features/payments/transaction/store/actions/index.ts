import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Transaction } from "../../../../../types/pagopa";
import { TransactionListItem } from "../../../../../../definitions/pagopa/biz-events/TransactionListItem";

export type PaymentsGetTransactionPayload = {
  size?: number;
  continuationToken?: string;
};

export const getPaymentsTransactionsAction = createAsyncAction(
  "PAYMENTS_TRANSACTIONS_LIST_REQUEST",
  "PAYMENTS_TRANSACTIONS_LIST_SUCCESS",
  "PAYMENTS_TRANSACTIONS_LIST_FAILURE",
  "PAYMENTS_TRANSACTIONS_LIST_CANCEL"
)<
  PaymentsGetTransactionPayload,
  ReadonlyArray<TransactionListItem>,
  NetworkError,
  void
>();

export const getPaymentsTransactionDetailsAction = createAsyncAction(
  "PAYMENTS_TRANSACTION_DETAILS_REQUEST",
  "PAYMENTS_TRANSACTION_DETAILS_SUCCESS",
  "PAYMENTS_TRANSACTION_DETAILS_FAILURE",
  "PAYMENTS_TRANSACTION_DETAILS_CANCEL"
)<{ transactionId: number }, Transaction, NetworkError, void>();

export type PaymentsTransactionActions =
  | ActionType<typeof getPaymentsTransactionDetailsAction>
  | ActionType<typeof getPaymentsTransactionsAction>;
