import { put } from "typed-redux-saga/macro";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { getCdcStatusWallet } from "../../bonus/cdc/wallet/store/actions";

/**
 * This saga handles the update of the wallet screen
 * Extend this function to add calls that the wallet screen needs to perform to update/refresh its content
 */
export function* handleWalletUpdateSaga() {
  // Updates the user methods
  yield* put(getPaymentsWalletUserMethods.request());
  // Updates the IDPay wallet, if active
  yield* put(idPayWalletGet.request());
  // Updates the CGN details
  yield* put(cgnDetails.request());
  // Updates the CDC status
  yield* put(getCdcStatusWallet.request());
}
