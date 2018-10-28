import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { call, Effect, put, select } from "redux-saga/effects";

import { ActionType } from "typesafe-actions";
import { GetServiceT } from "../../../definitions/backend/requestTypes";
import {
  loadServiceFailure,
  loadServiceRequest,
  loadServiceSuccess
} from "../../store/actions/services";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import * as pot from "../../types/pot";
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
  // If we already have the service in the store just return it
  const cachedService: ReturnType<
    ReturnType<typeof serviceByIdSelector>
  > = yield select<GlobalState>(serviceByIdSelector(action.payload));
  if (
    cachedService !== undefined &&
    pot.isSome(cachedService) &&
    !pot.isError(cachedService) &&
    !pot.isLoading(cachedService)
  ) {
    // we have already loaded this service
    return;
  }

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
