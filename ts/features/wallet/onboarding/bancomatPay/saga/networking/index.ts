import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { rawBPay } from "../../../../../../store/reducers/wallet/__mocks__/wallets";
import { addBPayToWallet, searchUserBPay } from "../../store/actions";

/**
 * Load all the user BPay accounts
 * TODO: replace with real implementation
 */
export function* loadBPaySaga(_: ActionType<typeof searchUserBPay.request>) {
  yield delay(100);
  yield put(searchUserBPay.success([{}]));
}

/**
 * Add bpay account to the wallet
 * TODO: replace with real implementation
 */
export function* addBPayToWalletSaga(
  _: ActionType<typeof addBPayToWallet.request>
) {
  yield delay(100);

  yield put(addBPayToWallet.success(rawBPay));
}
