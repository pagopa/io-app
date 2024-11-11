import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { TransactionClient } from "../../common/api/client";
import {
  getPaymentsBizEventsReceiptAction,
  getPaymentsBizEventsTransactionDetailsAction,
  getPaymentsBizEventsTransactionsAction,
  getPaymentsLatestBizEventsTransactionsAction,
  hidePaymentsBizEventsReceiptAction
} from "../store/actions";
import { handleGetBizEventsTransactionDetails } from "./handleGetBizEventsTransactionDetails";
import { handleGetBizEventsTransactionReceipt } from "./handleGetBizEventsTransactionReceipt";
import { handleGetBizEventsTransactions } from "./handleGetBizEventsTransactions";
import { handleGetLatestBizEventsTransactions } from "./handleGetLatestBizEventsTransactions";
import { handleDisableBizEventsTransactionReceipt } from "./handleDisableBizEventsTransactionReceipt";

/**
 * Handle Wallet transaction requests
 * @param bearerToken
 */
export function* watchPaymentsBizEventsTransactionSaga(
  transactionClient: TransactionClient
): SagaIterator {
  yield* takeLatest(
    getPaymentsBizEventsTransactionsAction.request,
    handleGetBizEventsTransactions,
    transactionClient.getPaidNotices
  );

  yield* takeLatest(
    getPaymentsLatestBizEventsTransactionsAction.request,
    handleGetLatestBizEventsTransactions,
    transactionClient.getPaidNotices
  );

  yield* takeLatest(
    getPaymentsBizEventsTransactionDetailsAction.request,
    handleGetBizEventsTransactionDetails,
    transactionClient.getPaidNoticeDetail
  );

  yield* takeLatest(
    getPaymentsBizEventsReceiptAction.request,
    handleGetBizEventsTransactionReceipt,
    transactionClient.generatePDF
  );

  yield* takeLatest(
    hidePaymentsBizEventsReceiptAction.request,
    handleDisableBizEventsTransactionReceipt,
    transactionClient.disablePaidNotice
  );
}
