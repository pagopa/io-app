import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as pot from "italia-ts-commons/lib/pot";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, put, select, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { ContentClient } from "../api/content";

import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../definitions/content/Service";

import {
  contentMunicipalityLoad,
  contentServiceLoad
} from "../store/actions/content";

import { readableReport } from "italia-ts-commons/lib/reporters";
import { ServiceId } from "../../definitions/backend/ServiceId";
import {
  firstServicesLoad,
  markServiceAsRead
} from "../store/actions/services";
import { visibleServicesMetadataLoadStateSelector } from "../store/reducers/entities/services";
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

      const data =
        response.isRight() && response.value.status === 200
          ? response.value.value
          : undefined;
      yield put(contentServiceLoad.success({ serviceId, data }));
      // If the service is loaded for the first time, the app shows the service list item without badge
      const isFirstServiceLoadingCompleted = yield select(
        isFirstVisibleServiceLoadCompletedSelector
      );
      if (pot.isNone(isFirstServiceLoadingCompleted)) {
        yield put(markServiceAsRead(serviceId));
      }
    } catch (e) {
      yield put(
        contentServiceLoad.failure({
          serviceId,
          error: e || Error(`Unable to load metadata for service ${serviceId}`)
        })
      );
    }

    // Check if the first services loading is going on and, when it ends up, check is errors occur
    const isFirstServiceLoadCompleted: pot.Pot<boolean, Error> = yield select(
      isFirstVisibleServiceLoadCompletedSelector
    );
    if (pot.isNone(isFirstServiceLoadCompleted)) {
      const visibleServicesMetadataLoadState = yield select(
        visibleServicesMetadataLoadStateSelector
      );

      if (pot.isSome(visibleServicesMetadataLoadState)) {
        yield put(firstServicesLoad.success());
      } else if (pot.isError(visibleServicesMetadataLoadState)) {
        yield put(
          firstServicesLoad.failure(
            Error("Error when loading metadata of one or more visible services")
          )
        );
      }
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
