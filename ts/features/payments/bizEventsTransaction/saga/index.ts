import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { TransactionClient } from "../../common/api/client";
import {
  getPaymentsLatestBizEventsTransactionsAction,
  getPaymentsBizEventsTransactionDetailsAction,
  getPaymentsBizEventsTransactionsAction
} from "../store/actions";
import { handleGetLatestBizEventsTransactions } from "./handleGetLatestBizEventsTransactions";
import { handleGetBizEventsTransactions } from "./handleGetBizEventsTransactions";
import { handleGetBizEventsTransactionDetails } from "./handleGetBizEventsTransactionDetails";

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
    transactionClient.getTransactionList
  );

  yield* takeLatest(
    getPaymentsLatestBizEventsTransactionsAction.request,
    handleGetLatestBizEventsTransactions,
    transactionClient.getTransactionList
  );

  yield* takeLatest(
    getPaymentsBizEventsTransactionDetailsAction.request,
    handleGetBizEventsTransactionDetails,
    transactionClient.getTransactionDetails
  );
}
