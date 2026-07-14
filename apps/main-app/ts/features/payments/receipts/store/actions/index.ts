import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { NoticeListWrapResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeListWrapResponse";
import { NetworkError } from "../../../../../utils/errors";
import { HideReceiptTrigger } from "../../analytics";
import { ReceiptDownloadFailure, ReceiptsCategoryFilter } from "../../types";

type PaymentsLatestReceiptSuccessPayload = {
  continuationToken?: string;
  data: NoticeListWrapResponse["notices"];
};

type PaymentsReceiptPayload = {
  continuationToken?: string;
  firstLoad?: boolean;
  noticeCategory?: ReceiptsCategoryFilter;
  onSuccess?: (continuationToken?: string) => void;
  size?: number;
};

type PaymentsReceiptSuccessPayload = {
  appendElements?: boolean;
  data: NoticeListWrapResponse["notices"];
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
)<void, PaymentsLatestReceiptSuccessPayload, NetworkError, void>();

type PaymentsTransactionDetailsPayload = {
  isPayer?: boolean;
  transactionId: string;
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

export type PaymentsTransactionReceiptInfoPayload = {
  base64File: string;
  filename?: string;
};

type PaymentsTransactionReceiptPayload = {
  onError?: () => void;
  onErrorGeneration?: () => void;
  onSuccess?: () => void;
  transactionId: string;
};

/** Asycn action to download biz-events transaction preview pdf */
export const getPaymentsReceiptDownloadAction = createAsyncAction(
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_REQUEST",
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_SUCCESS",
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_FAILURE",
  "PAYMENTS_RECEIPT_DOWNLOAD_PDF_CANCEL"
)<
  PaymentsTransactionReceiptPayload,
  PaymentsTransactionReceiptInfoPayload,
  NetworkError | ReceiptDownloadFailure,
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

export const setNeedsHomeListRefreshAction = createStandardAction(
  "PAYMENTS_RECEIPT_SET_NEEDS_HOME_LIST_REFRESH"
)<boolean>();

export type PaymentsReceiptActions =
  | ActionType<typeof getPaymentsLatestReceiptAction>
  | ActionType<typeof getPaymentsReceiptAction>
  | ActionType<typeof getPaymentsReceiptDetailsAction>
  | ActionType<typeof getPaymentsReceiptDownloadAction>
  | ActionType<typeof hidePaymentsReceiptAction>
  | ActionType<typeof setNeedsHomeListRefreshAction>;
