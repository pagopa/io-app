import * as t from "io-ts";
import { call, Effect, put, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { ContentClient } from "../api/content";

import { Service as ServiceMetadata } from "../../definitions/content/Service";

import { contentServiceLoad } from "../store/actions/content";

import { ServiceId } from "../../definitions/backend/ServiceId";
import { SagaCallReturnType } from "../types/utils";

const contentClient = ContentClient();

/**
 * Retrieves a service metadata from the static content repository
 */
function getServiceMetadata(
  serviceId: ServiceId
): Promise<t.Validation<ServiceMetadata> | undefined> {
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

    if (response && response.isRight()) {
      yield put(
        contentServiceLoad.success({ serviceId, data: response.value })
      );
    } else {
      yield put(contentServiceLoad.failure(serviceId));
    }
  });
}
