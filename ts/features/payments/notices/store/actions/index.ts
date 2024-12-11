import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { NoticeListWrapResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeListWrapResponse";
import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { NoticeEventsCategoryFilter } from "../../types";

export type PaymentsGetNoticePayload = {
  firstLoad?: boolean;
  noticeCategory?: NoticeEventsCategoryFilter;
  size?: number;
  continuationToken?: string;
  onSuccess?: (continuationToken?: string) => void;
};

export type PaymentsGetNoticeSuccessPayload = {
  data: NoticeListWrapResponse["notices"];
  appendElements?: boolean;
};

export const getPaymentsNoticeAction = createAsyncAction(
  "PAYMENTS_TRANSACTIONS_LIST_REQUEST",
  "PAYMENTS_TRANSACTIONS_LIST_SUCCESS",
  "PAYMENTS_TRANSACTIONS_LIST_FAILURE",
  "PAYMENTS_TRANSACTIONS_LIST_CANCEL"
)<
  PaymentsGetNoticePayload,
  PaymentsGetNoticeSuccessPayload,
  NetworkError,
  void
>();

export const getPaymentsLatestNoticeAction = createAsyncAction(
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_REQUEST",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_SUCCESS",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_FAILURE",
  "PAYMENTS_LATEST_TRANSACTIONS_LIST_CANCEL"
)<void, NoticeListWrapResponse["notices"], NetworkError, void>();

export type PaymentsTransactionDetailsPayload = {
  transactionId: string;
  isPayer?: boolean;
};

export const getPaymentsNoticeDetailsAction = createAsyncAction(
  "PAYMENTS_NOTICE_DETAILS_REQUEST",
  "PAYMENTS_NOTICE_DETAILS_SUCCESS",
  "PAYMENTS_NOTICE_DETAILS_FAILURE",
  "PAYMENTS_NOTICE_DETAILS_CANCEL"
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
export const getPaymentsNoticeReceiptAction = createAsyncAction(
  "PAYMENTS_NOTICE_DOWNLOAD_PDF_REQUEST",
  "PAYMENTS_NOTICE_DOWNLOAD_PDF_SUCCESS",
  "PAYMENTS_NOTICE_DOWNLOAD_PDF_FAILURE",
  "PAYMENTS_NOTICE_DOWNLOAD_PDF_CANCEL"
)<
  PaymentsTransactionReceiptPayload,
  PaymentsTransactionReceiptInfoPayload,
  NetworkError,
  void
>();

type PaymentsTransactionReceiptDeletePayload = {
  transactionId: string;
};

export const hidePaymentsNoticeReceiptAction = createAsyncAction(
  "PAYMENTS_NOTICE_HIDE_REQUEST",
  "PAYMENTS_NOTICE_HIDE_SUCCESS",
  "PAYMENTS_NOTICE_HIDE_FAILURE",
  "PAYMENTS_NOTICE_HIDE_CANCEL"
)<PaymentsTransactionReceiptDeletePayload, any, NetworkError, void>();

export type PaymentsNoticeActions =
  | ActionType<typeof getPaymentsNoticeAction>
  | ActionType<typeof getPaymentsLatestNoticeAction>
  | ActionType<typeof getPaymentsNoticeDetailsAction>
  | ActionType<typeof getPaymentsNoticeReceiptAction>
  | ActionType<typeof hidePaymentsNoticeReceiptAction>;
