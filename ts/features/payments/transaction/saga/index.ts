import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { WalletClient } from "../../common/api/client";
import { getPaymentsTransactionDetailsAction } from "../store/actions";
import { handleGetTransactionDetails } from "./handleGetTransactionDetails";

/**
 * Handle Wallet transaction requests
 * @param bearerToken
 */
export function* watchPaymentsTransactionSaga(
  walletClient: WalletClient
): SagaIterator {
  // TODO: Connect the saga code here to the BIZ Event API as asoon as it will be available (https://pagopa.atlassian.net/browse/IOBP-440)
  yield* takeLatest(
    getPaymentsTransactionDetailsAction.request,
    handleGetTransactionDetails,
    walletClient.getWalletById // TODO: Add the get transaction details API call here when BIZ Event API will be available
  );
}
