/**
 * this saga checks at regular intervals the backend status
 */
import { left } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { Millisecond } from "italia-ts-commons/lib/units";
import { call, Effect, fork, put, select } from "redux-saga/effects";
import {
  BackendPublicClient,
  BackendServicesStatus
} from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import { backendServicesStatus } from "../store/actions/backendServicesStatus";
import { appStateSelector } from "../store/reducers/appState";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

const BACKEND_SERVICES_STATUS_LOAD_INTERVAL = 5000 as Millisecond;

function* backendServicesStatusWatcher(): IterableIterator<Effect> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);

  function getServerServicesStatus(): Promise<
    t.Validation<BasicResponseType<BackendServicesStatus>>
  > {
    return new Promise((resolve, _) =>
      backendPublicClient
        .getServicesStatus({})
        .then(resolve, e => resolve(left([{ context: [], value: e }])))
    );
  }

  // check backend status periodically
  while (true) {
    try {
      const appCurrentState: ReturnType<typeof appStateSelector> = yield select(
        appStateSelector
      );
      // do it only when the app is foreground
      if (appCurrentState.appState !== "active") {
        yield call(startTimer, BACKEND_SERVICES_STATUS_LOAD_INTERVAL);
        continue;
      }
      const backendServicesStatusResponse: SagaCallReturnType<
        typeof getServerServicesStatus
      > = yield call(getServerServicesStatus, {});
      if (
        backendServicesStatusResponse.isRight() &&
        backendServicesStatusResponse.value.status === 200
      ) {
        yield put(
          backendServicesStatus(backendServicesStatusResponse.value.value)
        );
      }
    } catch (e) {
      // do nothing. it should be a network or decoding error
    } finally {
      yield call(startTimer, BACKEND_SERVICES_STATUS_LOAD_INTERVAL);
    }
  }
}

export default function* root(): IterableIterator<Effect> {
  yield fork(backendServicesStatusWatcher);
}
