import { put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import {
  addCoBadgeToWallet,
  loadCoBadgeAbiConfiguration,
  searchUserCoBadge
} from "../../store/actions";
import { StatusEnum } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";

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

/**
 * Load CoBadge configuration
 * TODO: add networking logic
 */
export function* handleLoadCoBadgeConfiguration(
  _: ActionType<typeof loadCoBadgeAbiConfiguration.request>
) {
  yield put(
    loadCoBadgeAbiConfiguration.success({
      ICCREA: {
        status: StatusEnum.enabled,
        issuers: [{ abi: "05048", name: "" }]
      }
    })
  );
}
