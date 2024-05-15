import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Transaction } from "../../../../../types/pagopa";
import { TransactionListItem } from "../../../../../../definitions/pagopa/biz-events/TransactionListItem";

export type PaymentsGetTransactionPayload = {
  firstLoad?: boolean;
  size?: number;
  continuationToken?: string;
  onSuccess?: (continuationToken?: string) => void;
};

export type PaymentsGetTransactionSuccessPayload = {
  data: ReadonlyArray<TransactionListItem>;
  appendElements?: boolean;
};

export const getPaymentsTransactionsAction = createAsyncAction(
  "PAYMENTS_TRANSACTIONS_LIST_REQUEST",
  "PAYMENTS_TRANSACTIONS_LIST_SUCCESS",
  "PAYMENTS_TRANSACTIONS_LIST_FAILURE",
  "PAYMENTS_TRANSACTIONS_LIST_CANCEL"
)<
  PaymentsGetTransactionPayload,
  PaymentsGetTransactionSuccessPayload,
  NetworkError,
  void
>();

export const getPaymentsLatestTransactionsAction = createAsyncAction(
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_REQUEST",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_SUCCESS",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_FAILURE",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_CANCEL"
)<void, ReadonlyArray<TransactionListItem>, NetworkError, void>();

export const getPaymentsTransactionDetailsAction = createAsyncAction(
  "PAYMENTS_TRANSACTION_DETAILS_REQUEST",
  "PAYMENTS_TRANSACTION_DETAILS_SUCCESS",
  "PAYMENTS_TRANSACTION_DETAILS_FAILURE",
  "PAYMENTS_TRANSACTION_DETAILS_CANCEL"
)<{ transactionId: number }, Transaction, NetworkError, void>();

export type PaymentsTransactionActions =
  | ActionType<typeof getPaymentsTransactionDetailsAction>
  | ActionType<typeof getPaymentsTransactionsAction>
  | ActionType<typeof getPaymentsLatestTransactionsAction>;
