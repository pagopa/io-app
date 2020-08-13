import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { loadServiceDetail } from "../../store/actions/services";
import { SagaCallReturnType } from "../../types/utils";
import { handleOrganizationNameUpdateSaga } from "../services/handleOrganizationNameUpdateSaga";
import { handleServiceReadabilitySaga } from "../services/handleServiceReadabilitySaga";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param action
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadServiceDetailRequestHandler(
  getService: ReturnType<typeof BackendClient>["getService"],
  action: ActionType<typeof loadServiceDetail["request"]>
): IterableIterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getService> = yield call(
      getService,
      { service_id: action.payload }
    );

    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }

    if (response.value.status === 200) {
      yield put(loadServiceDetail.success(response.value.value));

      // If it is occurring during the first load of serivces,
      // mark the service as read (it will not display the badge on the list item)
      yield call(handleServiceReadabilitySaga, action.payload);

      // Update, if needed, the name of the organization that provides the service
      yield call(handleOrganizationNameUpdateSaga, response.value.value);
    } else {
      throw Error(`response status ${response.value.status}`);
    }
  } catch (error) {
    yield put(loadServiceDetail.failure({ service_id: action.payload, error }));
  }
}
