import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { TransactionClient } from "../../common/api/client";
import {
  getPaymentsNoticeReceiptAction,
  getPaymentsNoticeDetailsAction,
  getPaymentsNoticeAction,
  getPaymentsLatestNoticeAction,
  hidePaymentsNoticeReceiptAction
} from "../store/actions";
import { handleGetNoticeDetails } from "./handleGetNoticeDetails";
import { handleGetReceipt } from "./handleGetReceipt";
import { handleGetNotice } from "./handleGetNotice";
import { handleGetLatestNotice } from "./handleGetLatestNotice";
import { handleDisableReceipt } from "./handleDisableReceipt";

/**
 * Handle Wallet transaction requests
 * @param bearerToken
 */
export function* watchPaymentsNoticeSaga(
  transactionClient: TransactionClient
): SagaIterator {
  yield* takeLatest(
    getPaymentsNoticeAction.request,
    handleGetNotice,
    transactionClient.getPaidNotices
  );

  yield* takeLatest(
    getPaymentsLatestNoticeAction.request,
    handleGetLatestNotice,
    transactionClient.getPaidNotices
  );

  yield* takeLatest(
    getPaymentsNoticeDetailsAction.request,
    handleGetNoticeDetails,
    transactionClient.getPaidNoticeDetail
  );

  yield* takeLatest(
    getPaymentsNoticeReceiptAction.request,
    handleGetReceipt,
    transactionClient.generatePDF
  );

  yield* takeLatest(
    hidePaymentsNoticeReceiptAction.request,
    handleDisableReceipt,
    transactionClient.disablePaidNotice
  );
}
