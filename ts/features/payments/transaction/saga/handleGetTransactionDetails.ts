import * as pot from "@pagopa/ts-commons/lib/pot";
import { put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsTransactionDetailsAction } from "../store/actions";
import { getTransactions } from "../../../../store/reducers/wallet/transactions";
import { getGenericError } from "../../../../utils/errors";

/**
 * Handle the remote call to get the transaction details
 * TODO: This is a temporary implementation to simulate the BIZ Event API, it will be replaced as soon as the BIZ Event API will be available (https://pagopa.atlassian.net/browse/IOBP-440)
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetTransactionDetails(
  _getTransactionDetails: any, // TODO: Replace with the real type when the BIZ Event API will be available
  action: ActionType<(typeof getPaymentsTransactionDetailsAction)["request"]>
) {
  // TODO: Add the whole logic here to call the BIZ Event API as soon as it will be available and replace the following code
  const transactions = yield* select(getTransactions);
  const transactionDetails = pot.toUndefined(
    pot.map(transactions, transactions =>
      transactions.find(trx => trx.id === action.payload.transactionId)
    )
  );
  if (transactionDetails) {
    yield* put(getPaymentsTransactionDetailsAction.success(transactionDetails));
    return;
  }
  yield* put(
    getPaymentsTransactionDetailsAction.failure({
      ...getGenericError(
        new Error(
          `Transaction details not found for transaction id ${action.payload.transactionId}`
        )
      )
    })
  );
}
