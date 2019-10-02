import * as pot from "italia-ts-commons/lib/pot";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { contentServiceLoad } from "../../store/actions/content";
import { firstServicesLoad, loadService } from "../../store/actions/services";
import {
  isFirstVisibleServiceLoadCompletedSelector,
  isVisibleServicesContentLoadCompletedSelector
} from "../../store/reducers/entities/services/firstServicesLoading";
import {
  servicesByIdSelector,
  ServicesByIdState
} from "../../store/reducers/entities/services/servicesById";
import {
  visibleServicesSelector,
  VisibleServicesState
} from "../../store/reducers/entities/services/visibleServices";
import { SagaCallReturnType } from "../../types/utils";
/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadServiceRequestHandler(
  getService: ReturnType<typeof BackendClient>["getService"],
  action: ActionType<typeof loadService["request"]>
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
      yield put(loadService.success(response.value.value));

      // Once the service content is loaded, the service metadata loading is requested.
      // Service metadata contains service scope (national/local) used to identify where
      // the service should be displayed into the ServiceHomeScreen
      yield put(contentServiceLoad.request(response.value.value.service_id));
    } else {
      throw Error();
    }
  } catch {
    yield put(loadService.failure(action.payload));

    // At startup, if any loadServiceSuccess, dispatch firstServicesLoad.failure

    // If at least one service content loading fails, the first services load is considered as failed
    const visibleServices: VisibleServicesState = yield select(
      visibleServicesSelector
    );
    const isFirstServiceLoading: pot.Pot<boolean, Error> = yield select(
      isFirstVisibleServiceLoadCompletedSelector
    );
    const isVisibleServicesContentLoadCompleted = yield select(
      isVisibleServicesContentLoadCompletedSelector
    );

    if (
      pot.isNone(isFirstServiceLoading) &&
      pot.isSome(visibleServices) &&
      isVisibleServicesContentLoadCompleted
    ) {
      const servicesById: ServicesByIdState = yield select(
        servicesByIdSelector
      );
      const isServicesContentLoadFailed =
        visibleServices.value.findIndex(service => {
          const serviceContent = servicesById[service.service_id];
          return serviceContent && pot.isError(serviceContent);
        }) !== -1;

      if (isServicesContentLoadFailed) {
        yield put(
          firstServicesLoad.failure(
            Error("Failed to load the content of one or more services")
          )
        );
      }
    }
  }
}
