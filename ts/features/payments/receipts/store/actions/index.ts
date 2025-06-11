import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { NoticeListWrapResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeListWrapResponse";
import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { ReceiptsCategoryFilter } from "../../types";
import { HideReceiptTrigger } from "../../analytics";

export type PaymentsReceiptPayload = {
  firstLoad?: boolean;
  noticeCategory?: ReceiptsCategoryFilter;
  size?: number;
  continuationToken?: string;
  onSuccess?: (continuationToken?: string) => void;
};

export type PaymentsReceiptSuccessPayload = {
  data: NoticeListWrapResponse["notices"];
  appendElements?: boolean;
};

export const getPaymentsReceiptAction = createAsyncAction(
  "PAYMENTS_RECEIPT_LIST_REQUEST",
  "PAYMENTS_RECEIPT_LIST_SUCCESS",
  "PAYMENTS_RECEIPT_LIST_FAILURE",
  "PAYMENTS_RECEIPT_LIST_CANCEL"
)<PaymentsReceiptPayload, PaymentsReceiptSuccessPayload, NetworkError, void>();

export const getPaymentsLatestReceiptAction = createAsyncAction(
  "PAYMENTS_LATEST_RECEIPT_LIST_REQUEST",
  "PAYMENTS_LATEST_RECEIPT_LIST_SUCCESS",
  "PAYMENTS_LATEST_RECEIPT_LIST_FAILURE",
  "PAYMENTS_LATEST_RECEIPT_LIST_CANCEL"
)<void, NoticeListWrapResponse["notices"], NetworkError, void>();

export type PaymentsTransactionDetailsPayload = {
  transactionId: string;
  isPayer?: boolean;
};

export const getPaymentsReceiptDetailsAction = createAsyncAction(
  "PAYMENTS_RECEIPT_DETAILS_REQUEST",
  "PAYMENTS_RECEIPT_DETAILS_SUCCESS",
  "PAYMENTS_RECEIPT_DETAILS_FAILURE",
  "PAYMENTS_RECEIPT_DETAILS_CANCEL"
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
export const getPaymentsReceiptDownloadAction = createAsyncAction(
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_REQUEST",
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_SUCCESS",
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_FAILURE",
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_CANCEL"
)<
  PaymentsTransactionReceiptPayload,
  PaymentsTransactionReceiptInfoPayload,
  NetworkError,
  void
>();

type PaymentsTransactionReceiptDeletePayload = {
  transactionId: string;
  trigger: HideReceiptTrigger;
};

export const hidePaymentsReceiptAction = createAsyncAction(
  "PAYMENTS_RECEIPT_HIDE_REQUEST",
  "PAYMENTS_RECEIPT_HIDE_SUCCESS",
  "PAYMENTS_RECEIPT_HIDE_FAILURE",
  "PAYMENTS_RECEIPT_HIDE_CANCEL"
)<PaymentsTransactionReceiptDeletePayload, any, NetworkError, void>();

export type PaymentsReceiptActions =
  | ActionType<typeof getPaymentsReceiptAction>
  | ActionType<typeof getPaymentsLatestReceiptAction>
  | ActionType<typeof getPaymentsReceiptDetailsAction>
  | ActionType<typeof getPaymentsReceiptDownloadAction>
  | ActionType<typeof hidePaymentsReceiptAction>;
