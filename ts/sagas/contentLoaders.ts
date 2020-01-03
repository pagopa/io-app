import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as pot from "italia-ts-commons/lib/pot";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, put, select, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../definitions/content/Service";
import { ServicesByScope } from "../../definitions/content/ServicesByScope";
import { ContentClient } from "../api/content";
import {
  contentMunicipalityLoad,
  loadServiceMetadata,
  metadataServicesByScopeLoad
} from "../store/actions/content";
import {
  firstServiceLoadSuccess,
  markServiceAsRead
} from "../store/actions/services";
import { servicesByScopeSelector } from "../store/reducers/content";
import { visibleServicesContentLoadStateSelector } from "../store/reducers/entities/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../store/reducers/entities/services/firstServicesLoading";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";
import { SagaCallReturnType } from "../types/utils";

const contentClient = ContentClient();

/**
 * Retrieves a service metadata from the static content repository
 */
function getServiceMetadata(
  serviceId: ServiceId
): Promise<t.Validation<BasicResponseType<ServiceMetadata>>> {
  return new Promise((resolve, _) =>
    contentClient
      .getService({ serviceId })
      .then(resolve, e => resolve(left([{ context: [], value: e }])))
  );
}

/**
 * Retrieves a view of services where the keys are the scopes and the value
 * is an array contains the id of services
 */
function getServicesByScope(): Promise<
  t.Validation<BasicResponseType<ServicesByScope>>
> {
  return new Promise((resolve, _) =>
    contentClient
      .getServicesByScope()
      .then(resolve, e => resolve(left([{ context: [], value: e }])))
  );
}

/**
 * A saga that watches for and executes requests to load services by scope
 */
export function* watchContentServicesByScopeLoad(): Iterator<Effect> {
  yield takeEvery(getType(metadataServicesByScopeLoad.request), function*() {
    try {
      const response: SagaCallReturnType<
        typeof getServicesByScope
      > = yield call(getServicesByScope);

      if (response.isRight() && response.value.status === 200) {
        yield put(metadataServicesByScopeLoad.success(response.value.value));
      } else {
        const error = response.fold(
          readableReport,
          ({ status }) => `response status ${status}`
        );
        throw Error(error);
      }
    } catch (e) {
      yield put(metadataServicesByScopeLoad.failure(e));
    }
  });
}

/**
 * A saga that watches for and executes requests to load service metadata.
 *
 * TODO: do not retrieve the content on each request, rely on cache headers
 * https://www.pivotaltracker.com/story/show/159440224
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchServiceMetadataLoadSaga(): Iterator<Effect> {
  yield takeEvery(getType(loadServiceMetadata.request), function*(
    action: ActionType<typeof loadServiceMetadata["request"]>
  ) {
    const serviceId = action.payload;
    try {
      const response: SagaCallReturnType<
        typeof getServiceMetadata
      > = yield call(getServiceMetadata, serviceId);

      if (response.isLeft()) {
        const error = response.fold(
          readableReport,
          ({ status }) => `response status ${status}`
        );
        throw Error(error);
      }

      const isFirstVisibleServiceLoadCompleted: ReturnType<
        typeof isFirstVisibleServiceLoadCompletedSelector
      > = yield select(isFirstVisibleServiceLoadCompletedSelector);

      if (response.isRight()) {
        if (response.value.status === 200 || response.value.status === 404) {
          // If 404, the service has no saved metadata
          const data =
            response.value.status === 200
              ? pot.some(response.value.value)
              : pot.some(undefined);
          yield put(loadServiceMetadata.success({ serviceId, data }));
          // If the service is loaded for the first time (at first startup or when the
          // cache is cleaned), the app shows the service list item without badge
          if (!isFirstVisibleServiceLoadCompleted) {
            yield put(markServiceAsRead(serviceId));
          }
        } else {
          throw Error(`response status ${response.value.status}`);
        }
      }
      // If all services content and scope data are loaded with success,
      // stop considering loaded services as read
      if (!isFirstVisibleServiceLoadCompleted) {
        const servicesByScope: ReturnType<
          typeof servicesByScopeSelector
        > = yield select(servicesByScopeSelector);
        const visibleServicesContentLoadState: ReturnType<
          typeof visibleServicesContentLoadStateSelector
        > = yield select(visibleServicesContentLoadStateSelector);
        if (
          pot.isSome(visibleServicesContentLoadState) &&
          pot.isSome(servicesByScope)
        ) {
          yield put(firstServiceLoadSuccess());
        }
      }
    } catch (e) {
      yield put(
        loadServiceMetadata.failure({
          serviceId,
          error: e || Error(`Unable to load metadata for service ${serviceId}`)
        })
      );
    }
  });
}

/**
 * Retrieves a municipality metadata from the static content repository
 */
function* fetchMunicipalityMetadata(
  getMunicipality: ReturnType<typeof ContentClient>["getMunicipality"],
  codiceCatastale: CodiceCatastale
): IterableIterator<Effect | Either<Error, MunicipalityMedadata>> {
  try {
    const response: SagaCallReturnType<typeof getMunicipality> = yield call(
      getMunicipality,
      { codiceCatastale }
    );
    // Can't decode response
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }
    if (response.value.status !== 200) {
      throw Error(`response status ${response.value.status}`);
    }
    return right(response.value.value);
  } catch (error) {
    return left(error);
  }
}

/**
 * A saga that watches for and executes requests to load municipality metadata.
 */
export function* watchContentMunicipalityLoadSaga(): Iterator<Effect> {
  yield takeEvery(getType(contentMunicipalityLoad.request), function*(
    action: ActionType<typeof contentMunicipalityLoad["request"]>
  ) {
    const codiceCatastale = action.payload;
    try {
      const response: SagaCallReturnType<
        typeof fetchMunicipalityMetadata
      > = yield call(
        fetchMunicipalityMetadata,
        contentClient.getMunicipality,
        codiceCatastale
      );

      if (response.isRight()) {
        yield put(
          contentMunicipalityLoad.success({
            codiceCatastale,
            data: response.value
          })
        );
      } else {
        throw response.value;
      }
    } catch (e) {
      yield put(contentMunicipalityLoad.failure(e));
    }
  });
}
