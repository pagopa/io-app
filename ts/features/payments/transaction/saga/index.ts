import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { TransactionClient, WalletClient } from "../../common/api/client";
import {
  getPaymentsLatestTransactionsAction,
  getPaymentsTransactionDetailsAction,
  getPaymentsTransactionsAction
} from "../store/actions";
import { handleGetTransactionDetails } from "./handleGetTransactionDetails";
import { handleGetLatestTransactions } from "./handleGetLatestTransactions";
import { handleGetTransactions } from "./handleGetTransactions";

/**
 * Handle Wallet transaction requests
 * @param bearerToken
 */
export function* watchPaymentsTransactionSaga(
  walletClient: WalletClient,
  transactionClient: TransactionClient
): SagaIterator {
  // TODO: Connect the saga code here to the BIZ Event API as asoon as it will be available (https://pagopa.atlassian.net/browse/IOBP-440)
  yield* takeLatest(
    getPaymentsTransactionDetailsAction.request,
    handleGetTransactionDetails,
    walletClient.getWalletById // TODO: Add the get transaction details API call here when BIZ Event API will be available
  );

  yield* takeLatest(
    getPaymentsTransactionsAction.request,
    handleGetTransactions,
    transactionClient.getTransactionList
  );

  yield* takeLatest(
    getPaymentsLatestTransactionsAction.request,
    handleGetLatestTransactions,
    transactionClient.getTransactionList
  );
}
