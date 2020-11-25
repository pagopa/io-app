import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { searchUserPans } from "../../../bancomat/store/actions";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { searchUserSatispay } from "../../store/actions";
import { getNetworkError } from "../../../../../../utils/errors";

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
      if (searchSatispayWithRefreshResult.value.status === 200) {
        return yield put(
          searchUserSatispay.success(
            searchSatispayWithRefreshResult.value.value
          )
        );
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
