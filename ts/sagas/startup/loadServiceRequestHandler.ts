import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { call, Effect, put } from "redux-saga/effects";

import { ActionType } from "typesafe-actions";
import { GetServiceT } from "../../../definitions/backend/requestTypes";
import {
  loadServiceFailure,
  loadServiceRequest,
  loadServiceSuccess
} from "../../store/actions/services";
import { SagaCallReturnType } from "../../types/utils";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadServiceRequestHandler(
  getService: TypeofApiCall<GetServiceT>,
  action: ActionType<typeof loadServiceRequest>
): IterableIterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getService> = yield call(
      getService,
      { service_id: action.payload }
    );

    if (response !== undefined && response.status === 200) {
      yield put(loadServiceSuccess(response.value));
    } else {
      throw Error();
    }
  } catch {
    yield put(loadServiceFailure(action.payload));
  }
}
