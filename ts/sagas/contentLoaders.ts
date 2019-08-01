import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, put, takeEvery } from "redux-saga/effects";
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
      .then(resolve, () => resolve(undefined))
  );
}

/**
 * A saga that watches for and executes requests to load service metadata.
 *
 * TODO: do not retrieve the content on each request, rely on cache headers
 * https://www.pivotaltracker.com/story/show/159440224
 */
export function* watchContentServiceLoadSaga(): Iterator<Effect> {
  yield takeEvery(getType(contentServiceLoad.request), function*(
    action: ActionType<typeof contentServiceLoad["request"]>
  ) {
    const serviceId = action.payload;

    const response: SagaCallReturnType<typeof getServiceMetadata> = yield call(
      getServiceMetadata,
      serviceId
    );

    if (response.isRight() && response.value.status === 200) {
      yield put(
        contentServiceLoad.success({ serviceId, data: response.value.value })
      );
    } else {
      yield put(contentServiceLoad.failure(serviceId));
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
      yield put(contentMunicipalityLoad.failure(codiceCatastale));
    }
  });
}
