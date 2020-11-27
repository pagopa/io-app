import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import _ from "lodash";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { searchUserPans } from "../../../bancomat/store/actions";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { searchUserSatispay } from "../../store/actions";
import { getError, getNetworkError } from "../../../../../../utils/errors";
import { addSatispayToWallet as addSatispayToWalletAction } from "../../store/actions";

/**
 * search for user's satispay
 */
export function* handleSearchUserSatispay(
  searchSatispay: ReturnType<typeof PaymentManagerClient>["searchSatispay"],
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    const searchSatispayWithRefresh = sessionManager.withRefresh(
      searchSatispay({})
    );

    const searchSatispayWithRefreshResult: SagaCallReturnType<typeof searchSatispayWithRefresh> = yield call(
      searchSatispayWithRefresh
    );
    if (searchSatispayWithRefreshResult.isRight()) {
      const statusCode = searchSatispayWithRefreshResult.value.status;
      if (statusCode === 200) {
        const value = searchSatispayWithRefreshResult.value.value;
        // even if the user doesn't own satispay the response is 200 but the payload is empty
        // FIXME 200 must always contain a non-empty payload
        return yield put(
          searchUserSatispay.success(_.isEmpty(value.data) ? null : value)
        );
      } else if (statusCode === 404) {
        // the user doesn't own any satispay
        return yield put(searchUserSatispay.success(null));
      } else {
        return yield put(
          searchUserSatispay.failure({
            kind: "generic",
            value: new Error(
              `response status ${searchSatispayWithRefreshResult.value.status}`
            )
          })
        );
      }
    } else {
      return yield put(
        searchUserSatispay.failure({
          kind: "generic",
          value: new Error(
            readableReport(searchSatispayWithRefreshResult.value)
          )
        })
      );
    }
  } catch (e) {
    return yield put(searchUserPans.failure(getNetworkError(e)));
  }
}

/**
 * add the user's satispay to the wallet
 */
export function* handleAddUserSatispayToWallet(
  addSatispayToWallet: ReturnType<
    typeof PaymentManagerClient
  >["addSatispayToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof addSatispayToWalletAction.request>
) {
  try {
    const addSatispayToWalletWithRefresh = sessionManager.withRefresh(
      addSatispayToWallet({ data: action.payload })
    );

    const addSatispayToWalletWithRefreshResult: SagaCallReturnType<typeof addSatispayToWalletWithRefresh> = yield call(
      addSatispayToWalletWithRefresh
    );
    if (addSatispayToWalletWithRefreshResult.isRight()) {
      const statusCode = addSatispayToWalletWithRefreshResult.value.status;
      if (statusCode === 200) {
        // satispay has been added to the user wallet
        return yield put(addSatispayToWalletAction.success());
      } else {
        return yield put(
          addSatispayToWalletAction.failure(
            new Error(`response status ${statusCode}`)
          )
        );
      }
    } else {
      return yield put(
        addSatispayToWalletAction.failure(
          new Error(readableReport(addSatispayToWalletWithRefreshResult.value))
        )
      );
    }
  } catch (e) {
    return yield put(addSatispayToWalletAction.failure(getError(e)));
  }
}
