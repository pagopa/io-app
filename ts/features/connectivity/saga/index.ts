import * as E from "fp-ts/lib/Either";
import { call, fork, put, select } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { configureNetInfo, fetchNetInfoState } from "../utils";
import { startTimer } from "../../../utils/timer";
import { setConnectionStatus } from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { isConnectedSelector } from "../store/selectors";

const CONNECTIVITY_STATUS_LOAD_INTERVAL = (60 * 1000) as Millisecond;
const CONNECTIVITY_STATUS_FAILURE_INTERVAL = (10 * 1000) as Millisecond;

/**
 * this saga requests and checks the connection status
 */
export function* connectionStatusSaga(): Generator<
  ReduxSagaEffect,
  boolean,
  SagaCallReturnType<typeof fetchNetInfoState>
> {
  try {
    const response = yield* call(fetchNetInfoState());
    if (E.isRight(response) && response.right.isConnected) {
      yield* put(setConnectionStatus(response.right.isConnected));
      return true;
    }
    return false;
  } catch (e) {
    // do nothing. it should be a network or decoding error
    return false;
  }
}

/**
 * this saga requests and checks in loop connection status
 * if the connection is off app could show a warning message or avoid
 * the whole usage.
 */
export function* connectionStatusWatcherLoop() {
  // check backend status periodically
  while (true) {
    const response: SagaCallReturnType<typeof connectionStatusSaga> =
      yield* call(connectionStatusSaga);

    // if we have no information increase rate
    if (response === false) {
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
      continue;
    }

    const isAppConnected = yield* select(isConnectedSelector);

    // if backend is off increase rate
    if (!isAppConnected) {
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
    } else {
      yield* call(startTimer, CONNECTIVITY_STATUS_LOAD_INTERVAL);
    }
  }
}

export default function* root(): IterableIterator<ReduxSagaEffect> {
  configureNetInfo();
  yield* fork(connectionStatusWatcherLoop);
}
