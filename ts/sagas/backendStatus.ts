/**
 * this saga checks at regular intervals the status of backend
 */
import { left } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, fork, put } from "redux-saga/effects";
import { BackendPublicClient, ServicesStatus } from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";
import { backendServicesStatus } from "../store/actions/backendServicesStatus";

const BACKEND_SERVICES_STATUS_LOAD_INTERVAL = 5 * 1000;

function* backendServicesStatusWatcher(): IterableIterator<Effect> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);

  function getServerServicesStatus(): Promise<
    t.Validation<BasicResponseType<ServicesStatus>>
  > {
    return new Promise((resolve, _) =>
      backendPublicClient
        .getServicesStatus({})
        .then(resolve, e => resolve(left([{ context: [], value: e }])))
    );
  }

  while (true) {
    const backendServicesStatusResponse: SagaCallReturnType<
      typeof getServerServicesStatus
    > = yield call(getServerServicesStatus, {});
    if (
      backendServicesStatusResponse.isRight() &&
      backendServicesStatusResponse.value.status === 200
    ) {
      yield put(
        backendServicesStatus(
          backendServicesStatusResponse.value.value.status === "ok"
        )
      );
    }
    yield call(startTimer, BACKEND_SERVICES_STATUS_LOAD_INTERVAL);
  }
}

export default function* root(): IterableIterator<Effect> {
  yield fork(backendServicesStatusWatcher);
}
