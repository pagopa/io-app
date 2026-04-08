import { ActionType } from "typesafe-actions";
import { put, select } from "typed-redux-saga/macro";
import { getCdcStatusWallet } from "../../bonus/cdc/wallet/store/actions";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { isCgnAlreadyFetchedSelector } from "../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { walletUpdate } from "../store/actions";

/**
 * This saga handles the update of the wallet screen
 * Extend this function to add calls that the wallet screen needs to perform to update/refresh its content
 */
export function* handleWalletUpdateSaga(
  action: ActionType<typeof walletUpdate>
) {
  // Updates the user methods
  yield* put(getPaymentsWalletUserMethods.request());
  // Updates the IDPay wallet, if active
  yield* put(idPayWalletGet.request());
  // Updates the CGN details only on refresh or if not already fetched
  const cgnAlreadyFetched = yield* select(isCgnAlreadyFetchedSelector);
  if (action.payload?.isRefresh || !cgnAlreadyFetched) {
    yield* put(cgnDetails.request());
  }
  // Updates the CDC status
  yield* put(getCdcStatusWallet.request());
}
