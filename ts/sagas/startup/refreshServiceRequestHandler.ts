import { left } from "fp-ts/lib/Either";
import { call, Effect, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { contentServiceLoad } from "../../store/actions/content";
import { loadService, refreshService } from "../../store/actions/services";
import { SagaCallReturnType } from "../../types/utils";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* refreshServiceRequestHandler(
  getService: ReturnType<typeof BackendClient>["getService"],
  action: ActionType<typeof refreshService>
): IterableIterator<Effect> {
  try {
    const { service_id, version } = action.payload;
    const response: SagaCallReturnType<typeof getService> = yield call(
      getService,
      { service_id }
    );

    if (response.isLeft()) {
      yield put(loadService.failure(service_id));
      return;
    }
    if (
      response.value.status === 200 &&
      version < response.value.value.version
    ) {
      yield put(loadService.success(response.value.value));

      // Once the service content is loaded, the service metadata loading is requested.
      // Service metadata contains service scope (national/local) used to identify where
      // the service should be displayed into the ServiceHomeScreen
      yield put(contentServiceLoad.request(service_id));
    }
  } catch (error) {
    return left(error);
  }
}
