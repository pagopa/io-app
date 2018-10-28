import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { all, call, Effect, put } from "redux-saga/effects";

import { GetVisibleServicesT } from "../../../definitions/backend/requestTypes";
import { sessionExpired } from "../../store/actions/authentication";
import {
  loadServiceRequest,
  loadVisibleServicesFailure,
  loadVisibleServicesSuccess
} from "../../store/actions/services";
import { SagaCallReturnType } from "../../types/utils";
import { isDefined } from "../../utils/guards";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadVisibleServicesRequestHandler(
  getVisibleServices: TypeofApiCall<GetVisibleServicesT>
): IterableIterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getVisibleServices> = yield call(
      getVisibleServices,
      {}
    );

    if (response !== undefined && response.status === 200) {
      const { items } = response.value;
      yield put(loadVisibleServicesSuccess(items));
      // Fetch the services detail in parallel
      const serviceIds = items.map(_ => _.service_id).filter(isDefined);
      yield all(serviceIds.map(id => put(loadServiceRequest(id))));
    } else if (response !== undefined && response.status === 401) {
      // on 401, expire the current session and restart the authentication flow
      yield put(sessionExpired());
      return;
    } else {
      throw Error();
    }
  } catch {
    yield put(loadVisibleServicesFailure());
  }
}
