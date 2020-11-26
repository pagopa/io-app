import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import _ from "lodash";
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
