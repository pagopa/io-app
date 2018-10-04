import { call, Effect, put, takeEvery } from "redux-saga/effects";

import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { ActionType, getType } from "typesafe-actions";

import { ContentClient } from "../api/content";

import { Service as ServiceMetadata } from "../../definitions/content/Service";

import {
  contentServiceLoadFailure,
  contentServiceLoadSuccess
} from "../store/actions/content";

import { ServiceId } from "../../definitions/backend/ServiceId";
import { SagaCallReturnType } from "../types/utils";

const contentClient = ContentClient();

/**
 * Retrieves a service metadata from the static content repository
 */
function getServiceMetadata(
  serviceId: ServiceId
): Promise<BasicResponseType<ServiceMetadata> | undefined> {
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
  yield takeEvery(getType(contentServiceLoadSuccess), function*(
    action: ActionType<typeof contentServiceLoadSuccess>
  ) {
    const { serviceId } = action.payload;

    const response: SagaCallReturnType<typeof getServiceMetadata> = yield call(
      getServiceMetadata,
      serviceId
    );

    if (response && response.status === 200) {
      yield put(contentServiceLoadSuccess(serviceId, response.value));
    } else {
      yield put(contentServiceLoadFailure(serviceId));
    }
  });
}
