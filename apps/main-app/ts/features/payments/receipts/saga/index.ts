import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { TransactionClient } from "../../common/api/client";
import {
  getPaymentsLatestReceiptAction,
  getPaymentsReceiptAction,
  getPaymentsReceiptDetailsAction,
  getPaymentsReceiptDownloadAction,
  hidePaymentsReceiptAction
} from "../store/actions";
import { handleDisableReceipt } from "./handleDisableReceipt";
import { handleGetLatestReceipt } from "./handleGetLatestReceipt";
import { handleGetReceipt } from "./handleGetReceipt";
import { handleGetReceiptDetails } from "./handleGetReceiptDetails";
import { handleGetReceiptPdf } from "./handleGetReceiptPdf";

/**
 * Handle Wallet transaction requests
 * @param bearerToken
 */
export function* watchPaymentsReceiptSaga(
  transactionClient: TransactionClient
): SagaIterator {
  yield* takeLatest(
    getPaymentsReceiptAction.request,
    handleGetReceipt,
    transactionClient.getPaidNotices
  );

  yield* takeLatest(
    getPaymentsLatestReceiptAction.request,
    handleGetLatestReceipt,
    transactionClient.getPaidNotices
  );

  yield* takeLatest(
    getPaymentsReceiptDetailsAction.request,
    handleGetReceiptDetails,
    transactionClient.getPaidNoticeDetail
  );

  yield* takeLatest(
    getPaymentsReceiptDownloadAction.request,
    handleGetReceiptPdf,
    transactionClient.generatePDF
  );

  yield* takeLatest(
    hidePaymentsReceiptAction.request,
    handleDisableReceipt,
    transactionClient.disablePaidNotice
  );
}
