import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { ContentClient } from "../../../../../../api/content";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { loadPrivativeIssuers } from "../../store/actions";

/**
 * Load Privative Issuers configuration
 */
export function* handleLoadPrivativeConfiguration(
  getPrivativeServices: ReturnType<
    typeof ContentClient
  >["getPrivativeServices"],
  _: ActionType<typeof loadPrivativeIssuers.request>
) {
  try {
    const getPrivativeServicesResult: SagaCallReturnType<
      typeof getPrivativeServices
    > = yield call(getPrivativeServices);
    if (getPrivativeServicesResult.isRight()) {
      if (getPrivativeServicesResult.value.status === 200) {
        yield put(
          loadPrivativeIssuers.success(getPrivativeServicesResult.value.value)
        );
      } else {
        throw new Error(
          `response status ${getPrivativeServicesResult.value.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(getPrivativeServicesResult.value));
    }
  } catch (e) {
    yield put(loadPrivativeIssuers.failure(getNetworkError(e)));
  }
}
