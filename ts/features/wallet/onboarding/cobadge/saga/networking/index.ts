import { put, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { WalletTypeEnum } from "../../../../../../../definitions/pagopa/WalletV2";
import { EnableableFunctionsTypeEnum } from "../../../../../../types/pagopa";
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
  yield delay(1500);
  yield put(
    searchUserCoBadge.success({
      payload: { paymentInstruments: [{}], searchRequestMetadata: [{}] }
    })
  );
}

/**
 * Add Cobadge to wallet
 * TODO: add networking logic
 */
export function* handleAddCoBadgeToWallet(
  _: ActionType<typeof addCoBadgeToWallet.request>
) {
  yield delay(1500);
  yield put(
    addCoBadgeToWallet.success({
      kind: "CreditCard",
      info: {},
      walletType: WalletTypeEnum.Card,
      idWallet: 1,
      pagoPA: false,
      enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
    })
  );
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
        issuers: [{ abi: "03078", name: "" }]
      }
    })
  );
}
