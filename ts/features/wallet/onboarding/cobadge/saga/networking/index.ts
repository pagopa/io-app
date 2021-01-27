import { put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { addCoBadgeToWallet, searchUserCoBadge } from "../../store/actions";

/**
 * Load the user Cobadge
 *  * TODO: add networking logic
 */
export function* handleSearchUserCoBadge(
  _: ActionType<typeof searchUserCoBadge.request>
) {
  yield put(searchUserCoBadge.success([]));
}

/**
 * Add Cobadge to wallet
 * TODO: add networking logic
 */
export function* handleAddCoBadgeToWallet(
  _: ActionType<typeof addCoBadgeToWallet.request>
) {
  yield put(addCoBadgeToWallet.failure({ kind: "timeout" }));
}
