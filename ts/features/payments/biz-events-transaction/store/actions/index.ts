import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { TransactionListItem } from "../../../../../../definitions/pagopa/biz-events/TransactionListItem";
import { TransactionDetailResponse } from "../../../../../../definitions/pagopa/biz-events/TransactionDetailResponse";

export type PaymentsGetBizEventsTransactionPayload = {
  firstLoad?: boolean;
  size?: number;
  continuationToken?: string;
  onSuccess?: (continuationToken?: string) => void;
};

export type PaymentsGetBizEventsTransactionSuccessPayload = {
  data: ReadonlyArray<TransactionListItem>;
  appendElements?: boolean;
};

export const getPaymentsBizEventsTransactionsAction = createAsyncAction(
  "PAYMENTS_TRANSACTIONS_LIST_REQUEST",
  "PAYMENTS_TRANSACTIONS_LIST_SUCCESS",
  "PAYMENTS_TRANSACTIONS_LIST_FAILURE",
  "PAYMENTS_TRANSACTIONS_LIST_CANCEL"
)<
  PaymentsGetBizEventsTransactionPayload,
  PaymentsGetBizEventsTransactionSuccessPayload,
  NetworkError,
  void
>();

export const getPaymentsLatestBizEventsTransactionsAction = createAsyncAction(
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_REQUEST",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_SUCCESS",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_FAILURE",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_CANCEL"
)<void, ReadonlyArray<TransactionListItem>, NetworkError, void>();

export const getPaymentsBizEventsTransactionDetailsAction = createAsyncAction(
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_REQUEST",
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_SUCCESS",
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_FAILURE",
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_CANCEL"
)<{ transactionId: string }, TransactionDetailResponse, NetworkError, void>();

export type PaymentsTransactionBizEventsActions =
  | ActionType<typeof getPaymentsBizEventsTransactionsAction>
  | ActionType<typeof getPaymentsLatestBizEventsTransactionsAction>
  | ActionType<typeof getPaymentsBizEventsTransactionDetailsAction>;
