import { call, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import {
  addCoBadgeToWallet,
  loadCoBadgeAbiConfiguration,
  searchUserCoBadge
} from "../../store/actions";
import { StatusEnum } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { getNetworkError } from "../../../../../../utils/errors";
import { onboardingCoBadgeSearchRequestId } from "../../store/reducers/searchCoBadgeRequestId";

/**
 * Load the user Cobadge onboardingCoBadgeSearchRequest is found then it will be used
 * within the search searchCobadgePans API, otherwise getCobadgePans will be used
 * if a previous stored
 */
export function* handleSearchUserCoBadge(
  getCobadgePans: ReturnType<typeof PaymentManagerClient>["getCobadgePans"],
  searchCobadgePans: ReturnType<
    typeof PaymentManagerClient
  >["searchCobadgePans"],
  sessionManager: SessionManager<PaymentManagerToken>,
  searchAction: ActionType<typeof searchUserCoBadge.request>
) {
  try {
    const onboardingCoBadgeSearchRequest: ReturnType<typeof onboardingCoBadgeSearchRequestId> = yield select(
      onboardingCoBadgeSearchRequestId
    );
    const getPansWithRefresh = sessionManager.withRefresh(
      getCobadgePans(searchAction.payload)
    );

    const getPansWithRefreshResult: SagaCallReturnType<typeof getPansWithRefresh> = yield call(
      onboardingCoBadgeSearchRequest
        ? sessionManager.withRefresh(
            searchCobadgePans(onboardingCoBadgeSearchRequest)
          )
        : getPansWithRefresh
    );
    if (getPansWithRefreshResult.isRight()) {
      if (getPansWithRefreshResult.value.status === 200) {
        return yield put(
          searchUserCoBadge.success(getPansWithRefreshResult.value.value)
        );
      } else {
        return yield put(
          searchUserCoBadge.failure({
            kind: "generic",
            value: new Error(
              `response status ${getPansWithRefreshResult.value.status}`
            )
          })
        );
      }
    } else {
      return yield put(
        searchUserCoBadge.failure({
          kind: "generic",
          value: new Error(readableReport(getPansWithRefreshResult.value))
        })
      );
    }
  } catch (e) {
    return yield put(searchUserCoBadge.failure(getNetworkError(e)));
  }
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
      ICCREA: { status: StatusEnum.enabled, issuers: [{ abi: "1", name: "" }] }
    })
  );
}
