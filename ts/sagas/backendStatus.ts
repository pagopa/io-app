/**
 * this saga checks at regular intervals the backend status
 */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { call, fork, put, select } from "typed-redux-saga/macro";
import { CdnBackendStatusClient } from "../api/backendPublic";
import { contentRepoUrl } from "../config";
import { backendStatusLoadSuccess } from "../store/actions/backendStatus";
import {
  deadsCounterSelector,
  isBackendServicesStatusOffSelector
} from "../store/reducers/backendStatus/backendInfo";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

const BACKEND_SERVICES_STATUS_LOAD_INTERVAL = (60 * 1000) as Millisecond;
const BACKEND_SERVICES_STATUS_FAILURE_INTERVAL = (10 * 1000) as Millisecond;

// Return true if it has information (200) false otherwise
export function* backendStatusSaga(
  getServicesStatus: ReturnType<typeof CdnBackendStatusClient>["getStatus"]
): Generator<
  ReduxSagaEffect,
  boolean,
  SagaCallReturnType<typeof getServicesStatus>
> {
  try {
    const response = yield* call(getServicesStatus, {});
    if (E.isRight(response) && response.right.status === 200) {
      yield* put(backendStatusLoadSuccess(response.right.value));
      return true;
    }
    return false;
  } catch (e) {
    // do nothing. it should be a network or decoding error
    return false;
  }
}

/**
 * this saga requests and checks in loop backend services status
 * if some of them is critical app could show a warning message or avoid
 * the whole usage.
 */
export function* backendStatusWatcherLoop(
  getStatus: ReturnType<typeof CdnBackendStatusClient>["getStatus"]
) {
  // check backend status periodically
  while (true) {
    const response: SagaCallReturnType<typeof backendStatusSaga> = yield* call(
      backendStatusSaga,
      getStatus
    );

    // if we have no information increase rate
    if (response === false) {
      yield* call(startTimer, BACKEND_SERVICES_STATUS_FAILURE_INTERVAL);
      continue;
    }

    const areSystemsDead = yield* select(isBackendServicesStatusOffSelector);

    // if backend is off increase rate
    if (areSystemsDead) {
      yield* call(startTimer, BACKEND_SERVICES_STATUS_FAILURE_INTERVAL);
      continue;
    }
    const deadsCounter: ReturnType<typeof deadsCounterSelector> = yield* select(
      deadsCounterSelector
    );

    // if counter of dead > 0 but areSystem if false (must do other check to valid this information)
    // we change the sleep timeout (more frequent when dead is detected)
    const sleepTime =
      deadsCounter > 0 && areSystemsDead === false
        ? BACKEND_SERVICES_STATUS_FAILURE_INTERVAL
        : BACKEND_SERVICES_STATUS_LOAD_INTERVAL;
    yield* call(startTimer, sleepTime);
  }
}

export default function* root(): IterableIterator<ReduxSagaEffect> {
  const cdnBackendClient = CdnBackendStatusClient(contentRepoUrl);
  yield* fork(backendStatusWatcherLoop, cdnBackendClient.getStatus);
}
