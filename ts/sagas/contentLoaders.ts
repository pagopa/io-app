import { call, Effect, put, takeEvery } from "redux-saga/effects";

import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { ActionType, getType } from "typesafe-actions";

import { ContentClient } from "../api/content";

import { Either } from "fp-ts/lib/Either";
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
): Promise<Either<Error, BasicResponseType<ServiceMetadata>>> {
  return new Promise((resolve, _) =>
    contentClient.getService({ serviceId }).then(
      x => {
        return x;
      },
      () => resolve(undefined)
    )
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
        contentServiceLoad.success({ serviceId, data: response.value })
      );
    } else {
      yield put(contentServiceLoad.failure(serviceId));
    }
  });
}
