/**
 * This module implements the sagas to retrive data from the content client:
 */
import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as pot from "italia-ts-commons/lib/pot";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { SagaIterator } from "redux-saga";
import { call, Effect, put, takeEvery, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { ContextualHelp } from "../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../definitions/content/Service";
import { ServicesByScope } from "../../definitions/content/ServicesByScope";
import { ContentClient } from "../api/content";
import {
  contentMunicipalityLoad,
  loadContextualHelpData,
  loadServiceMetadata,
  loadVisibleServicesByScope
} from "../store/actions/content";
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
 * Retrieves idps text data from the static content repository
 */
function getContextualHelpData(): Promise<
  t.Validation<BasicResponseType<ContextualHelp>>
> {
  return new Promise((resolve, _) =>
    contentClient
      .getContextualHelp()
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
function* watchContentServicesByScopeLoad(): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof getServicesByScope> = yield call(
      getServicesByScope
    );

    if (response.isRight() && response.value.status === 200) {
      yield put(loadVisibleServicesByScope.success(response.value.value));
    } else {
      const error = response.fold(
        readableReport,
        ({ status }) => `response status ${status}`
      );
      throw Error(error);
    }
  } catch (e) {
    yield put(loadVisibleServicesByScope.failure(e));
  }
}

/**
 * A saga that watches for and executes requests to load service metadata.
 *
 * TODO: do not retrieve the metadata on each request, rely on cache headers
 * https://www.pivotaltracker.com/story/show/159440224
 */
function* watchServiceMetadataLoadSaga(
  action: ActionType<typeof loadServiceMetadata["request"]>
): SagaIterator {
  const serviceId = action.payload;
  try {
    const response: SagaCallReturnType<typeof getServiceMetadata> = yield call(
      getServiceMetadata,
      serviceId
    );

    if (response.isLeft()) {
      const error = response.fold(
        readableReport,
        ({ status }) => `response status ${status}`
      );
      throw Error(error);
    }
    if (response.isRight()) {
      if (response.value.status === 200 || response.value.status === 404) {
        // If 404, the service has no saved metadata
        const data =
          response.value.status === 200
            ? pot.some(response.value.value)
            : pot.some(undefined);
        yield put(loadServiceMetadata.success({ serviceId, data }));
      } else {
        throw Error(`response status ${response.value.status}`);
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
}

/**
 * Retrieves a municipality metadata from the static content repository
 */
function* fetchMunicipalityMetadata(
  getMunicipality: ReturnType<typeof ContentClient>["getMunicipality"],
  codiceCatastale: CodiceCatastale
): Generator<
  Effect,
  Either<Error, MunicipalityMedadata>,
  SagaCallReturnType<typeof getMunicipality>
> {
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
function* watchContentMunicipalityLoadSaga(
  action: ActionType<typeof contentMunicipalityLoad["request"]>
): SagaIterator {
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
    yield put(
      contentMunicipalityLoad.failure({
        error: e,
        codiceCatastale
      })
    );
  }
}

/**
 * A saga that watches for and executes requests to load contextual help text data
 */
function* watchLoadContextualHelp(): SagaIterator {
  try {
    const response: SagaCallReturnType<
      typeof getContextualHelpData
    > = yield call(getContextualHelpData);
    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(loadContextualHelpData.success(response.value.value));
        return;
      }
      throw Error(`response status ${response.value.status}`);
    }
    throw Error(readableReport(response.value));
  } catch (e) {
    yield put(loadContextualHelpData.failure(e));
  }
}

export function* watchContentSaga() {
  // watch municipality loading request
  yield takeEvery(
    getType(contentMunicipalityLoad.request),
    watchContentMunicipalityLoadSaga
  );

  // watch service metadata loading request
  yield takeEvery(
    getType(loadServiceMetadata.request),
    watchServiceMetadataLoadSaga
  );

  // watch services by scope loading request
  yield takeEvery(
    getType(loadVisibleServicesByScope.request),
    watchContentServicesByScopeLoad
  );

  // Watch contextual help text data loading request
  yield takeLatest(
    getType(loadContextualHelpData.request),
    watchLoadContextualHelp
  );

  // Load content related to the contextual help body
  yield put(loadContextualHelpData.request());
}
