import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import {
  addCoBadgeToWallet,
  loadCoBadgeAbiConfiguration,
  searchUserCoBadge
} from "../../store/actions";
import { ContentClient } from "../../../../../../api/content";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";

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
  getCobadgeServices: ReturnType<typeof ContentClient>["getCobadgeServices"],
  _: ActionType<typeof loadCoBadgeAbiConfiguration.request>
) {
  try {
    const getCobadgeServicesResult: SagaCallReturnType<typeof getCobadgeServices> = yield call(
      getCobadgeServices
    );
    if (getCobadgeServicesResult.isRight()) {
      if (getCobadgeServicesResult.value.status === 200) {
        yield put(
          loadCoBadgeAbiConfiguration.success(
            getCobadgeServicesResult.value.value
          )
        );
      } else {
        throw new Error(
          `response status ${getCobadgeServicesResult.value.status}`
        );
      }
    } else {
      throw new Error(readableReport(getCobadgeServicesResult.value));
    }
  } catch (e) {
    yield put(loadCoBadgeAbiConfiguration.failure(getNetworkError(e)));
  }
}
