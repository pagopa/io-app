import * as pot from "@pagopa/ts-commons/lib/pot";
import { delay, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { walletTransactionDetailsGet } from "../store/actions";
import { getTransactions } from "../../../../store/reducers/wallet/transactions";
import { getGenericError } from "../../../../utils/errors";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetTransactionDetails(
  getTransactionDetails: any, // TODO: Replace with the real type when the BIZ Event API will be available
  token: string,
  action: ActionType<(typeof walletTransactionDetailsGet)["request"]>
) {
  // TODO: Add the whole logic here to call the BIZ Event API as soon as it will be available and replace the following code
  const transactions = yield* select(getTransactions);
  const transactionDetails = pot.getOrElse(
    pot.map(transactions, transactions =>
      transactions.find(trx => trx.id === action.payload.transactionId)
    ),
    null
  );
  if (transactionDetails) {
    yield* delay(4000);
    yield* put(walletTransactionDetailsGet.success(transactionDetails));
    return;
  }
  yield* put(
    walletTransactionDetailsGet.failure({
      ...getGenericError(
        new Error(
          `Transaction details not found for transaction id ${action.payload.transactionId}`
        )
      )
    })
  );
}
