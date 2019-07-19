import { left } from "fp-ts/lib/Either";
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
function getMunicipalityMetadata(
  codiceCatastale: CodiceCatastale
): Promise<t.Validation<BasicResponseType<MunicipalityMedadata>>> {
  return new Promise((resolve, _) =>
    contentClient.getMunicipality({ codiceCatastale }).then(resolve, () =>
      resolve(
        left([
          {
            context: [],
            value: "some error occurred while retrieving municipality metadata"
          }
        ])
      )
    )
  );
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
      typeof getMunicipalityMetadata
    > = yield call(getMunicipalityMetadata, codiceCatastale);

    if (response.isRight() && response.value.status === 200) {
      yield put(
        contentMunicipalityLoad.success({
          codiceCatastale,
          data: response.value.value
        })
      );
    } else {
      yield put(contentMunicipalityLoad.failure(codiceCatastale));
    }
  });
}
