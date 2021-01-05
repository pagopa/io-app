import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { RestBPayResponse } from "../../../../../../../definitions/pagopa/walletv2/RestBPayResponse";
import { searchUserBPay } from "../../store/actions";

/**
 * search for user's bpay
 */
export function* handleSearchUserBPay(
  searchBPay: ReturnType<typeof PaymentManagerClient>["searchBPay"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof searchUserBPay.request>
) {
  try {
    const searchBPayWithRefresh = sessionManager.withRefresh(
      searchBPay(action.payload)
    );

    const searchBPayWithRefreshResult: SagaCallReturnType<typeof searchBPayWithRefresh> = yield call(
      searchBPayWithRefresh
    );
    if (searchBPayWithRefreshResult.isRight()) {
      const statusCode = searchBPayWithRefreshResult.value.status;
      if (statusCode === 200) {
        const payload: RestBPayResponse =
          searchBPayWithRefreshResult.value.value;
        const bPayList = payload.data ?? [];
        return yield put(searchUserBPay.success(bPayList));
      } else if (statusCode === 404) {
        // the user doesn't own any bpay
        return yield put(searchUserBPay.success([]));
      } else {
        return yield put(
          searchUserBPay.failure({
            kind: "generic",
            value: new Error(
              `response status ${searchBPayWithRefreshResult.value.status}`
            )
          })
        );
      }
    } else {
      return yield put(
        searchUserBPay.failure({
          kind: "generic",
          value: new Error(readableReport(searchBPayWithRefreshResult.value))
        })
      );
    }
  } catch (e) {
    return yield put(searchUserBPay.failure(getNetworkError(e)));
  }
}
