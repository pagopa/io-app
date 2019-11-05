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
import { ContentClient } from "../api/content";
import {
  contentMunicipalityLoad,
  contentServiceLoad
} from "../store/actions/content";
import {
  FirstServiceLoadSuccess,
  markServiceAsRead
} from "../store/actions/services";
import {
  visibleServicesContentLoadStateSelector,
  visibleServicesMetadataLoadStateSelector
} from "../store/reducers/entities/services";
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
 * A saga that watches for and executes requests to load service metadata.
 *
 * TODO: do not retrieve the content on each request, rely on cache headers
 * https://www.pivotaltracker.com/story/show/159440224
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchContentServiceLoadSaga(): Iterator<Effect> {
  yield takeEvery(getType(contentServiceLoad.request), function*(
    action: ActionType<typeof contentServiceLoad["request"]>
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

      if (response.isRight() && response.value.status === 200) {
        yield put(
          contentServiceLoad.success({ serviceId, data: response.value.value })
        );
        // If the service is loaded for the first time (at first startup or when the
        // cache is cleaned), the app shows the service list item without badge
        if (!isFirstVisibleServiceLoadCompleted) {
          yield put(markServiceAsRead(serviceId));
        }
      } else {
        throw Error(`response status ${response.value.status}`);
      }

      // If all services content and metadata are loaded with success,
      // stop considering loaded services as read
      if (!isFirstVisibleServiceLoadCompleted) {
        const visibleServicesMetadataLoadState: ReturnType<
          typeof visibleServicesMetadataLoadStateSelector
        > = yield select(visibleServicesMetadataLoadStateSelector);
        const visibleServicesContentLoadState: ReturnType<
          typeof visibleServicesContentLoadStateSelector
        > = yield select(visibleServicesContentLoadStateSelector);
        if (
          pot.isSome(visibleServicesMetadataLoadState) &&
          pot.isSome(visibleServicesContentLoadState)
        ) {
          yield put(FirstServiceLoadSuccess());
        }
      }
    } catch (e) {
      yield put(
        contentServiceLoad.failure({
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
