/**
 * Load the user's privative card.
 */
import { call, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { searchUserCobadge } from "../../../cobadge/saga/networking/searchUserCobadge";
import { searchUserPrivative } from "../../store/actions";
import { onboardingPrivativeSearchRequestId } from "../../store/reducers/searchPrivativeRequestId";

export function* handleSearchUserPrivative(
  getCobadgePans: ReturnType<typeof PaymentManagerClient>["getCobadgePans"],
  searchCobadgePans: ReturnType<
    typeof PaymentManagerClient
  >["searchCobadgePans"],
  sessionManager: SessionManager<PaymentManagerToken>,
  searchAction: ActionType<typeof searchUserPrivative.request>
) {
  // try to retrieve the searchRequestId for privative search
  const searchRequestId: ReturnType<typeof onboardingPrivativeSearchRequestId> = yield select(
    onboardingPrivativeSearchRequestId
  );

  // get the results
  const result = yield call(
    searchUserCobadge,
    {
      abiCode: searchAction.payload.brandId,
      panCode: searchAction.payload.brandId
    },
    getCobadgePans,
    searchCobadgePans,
    sessionManager,
    searchRequestId
  );

  // dispatch the related action
  if (result.isRight()) {
    yield put(searchUserPrivative.success(result.value));
  } else {
    yield put(searchUserPrivative.failure(result.value));
  }
}
