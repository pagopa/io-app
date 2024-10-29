import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { NoticeListWrapResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeListWrapResponse";
import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";

export type PaymentsGetBizEventsTransactionPayload = {
  firstLoad?: boolean;
  size?: number;
  continuationToken?: string;
  onSuccess?: (continuationToken?: string) => void;
};

export type PaymentsGetBizEventsTransactionSuccessPayload = {
  data: NoticeListWrapResponse["notices"];
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
)<void, NoticeListWrapResponse["notices"], NetworkError, void>();

export type PaymentsTransactionDetailsPayload = {
  transactionId: string;
  isPayer?: boolean;
};

export const getPaymentsBizEventsTransactionDetailsAction = createAsyncAction(
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_REQUEST",
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_SUCCESS",
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_FAILURE",
  "PAYMENTS_BIZ_EVENTS_TRANSACTION_DETAILS_CANCEL"
)<
  PaymentsTransactionDetailsPayload,
  NoticeDetailResponse,
  NetworkError,
  void
>();

export type PaymentsTransactionReceiptPayload = {
  transactionId: string;
  onSuccess?: () => void;
  onError?: () => void;
};

export type PaymentsTransactionReceiptInfoPayload = {
  base64File: string;
  filename?: string;
};

/**
 * asycn action to download biz-events transaction preview pdf
 */
export const getPaymentsBizEventsReceiptAction = createAsyncAction(
  "PAYMENTS_BIZ_EVENTS_DOWNLOAD_PDF_REQUEST",
  "PAYMENTS_BIZ_EVENTS_DOWNLOAD_PDF_SUCCESS",
  "PAYMENTS_BIZ_EVENTS_DOWNLOAD_PDF_FAILURE",
  "PAYMENTS_BIZ_EVENTS_DOWNLOAD_PDF_CANCEL"
)<
  PaymentsTransactionReceiptPayload,
  PaymentsTransactionReceiptInfoPayload,
  NetworkError,
  void
>();

type PaymentsTransactionReceiptDeletePayload = {
  transactionId: string;
};

export const hidePaymentsBizEventsReceiptAction = createAsyncAction(
  "PAYMENTS_BIZ_EVENTS_HIDE_REQUEST",
  "PAYMENTS_BIZ_EVENTS_HIDE_SUCCESS",
  "PAYMENTS_BIZ_EVENTS_HIDE_FAILURE",
  "PAYMENTS_BIZ_EVENTS_HIDE_CANCEL"
)<PaymentsTransactionReceiptDeletePayload, any, NetworkError, void>();

export type PaymentsTransactionBizEventsActions =
  | ActionType<typeof getPaymentsBizEventsTransactionsAction>
  | ActionType<typeof getPaymentsLatestBizEventsTransactionsAction>
  | ActionType<typeof getPaymentsBizEventsTransactionDetailsAction>
  | ActionType<typeof getPaymentsBizEventsReceiptAction>
  | ActionType<typeof hidePaymentsBizEventsReceiptAction>;
