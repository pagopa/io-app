import { call, Effect, put, take } from "redux-saga/effects";

import { BasicResponseType } from "italia-ts-commons/lib/requests";

import { ContentClient, ServiceMetadata } from "../api/content";
import {
  ContentServiceLoad,
  contentServiceLoadFailure,
  contentServiceLoadSuccess
} from "../store/actions/content";

import { CONTENT_SERVICE_LOAD } from "../store/actions/constants";

export function* contentSaga(): IterableIterator<Effect> {
  const contentClient = ContentClient();

  function getService(
    serviceId: string
  ): Promise<BasicResponseType<ServiceMetadata> | undefined> {
    return new Promise((resolve, _) =>
      contentClient
        .getService({ serviceId })
        .then(resolve, () => resolve(undefined))
    );
  }

  while (true) {
    const loadAction: ContentServiceLoad = yield take(CONTENT_SERVICE_LOAD);

    const serviceId = loadAction.serviceId;

    const response: BasicResponseType<ServiceMetadata> | undefined = yield call(
      getService,
      serviceId
    );

    if (response && response.status === 200) {
      yield put(contentServiceLoadSuccess(serviceId, response.value));
    } else {
      yield put(contentServiceLoadFailure(serviceId));
    }
  }
}
