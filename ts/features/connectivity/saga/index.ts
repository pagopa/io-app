import * as E from "fp-ts/lib/Either";
import { call, fork, put, select, delay } from "typed-redux-saga/macro";
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
    if (E.isRight(response)) {
      if (
        response.right.isInternetReachable !== null &&
        response.right.isInternetReachable !== undefined
      ) {
        const isAppConnected =
          response.right.isConnected === true &&
          response.right.isInternetReachable === true;

        yield* put(setConnectionStatus(isAppConnected));
        return isAppConnected;
      }

      yield* delay(200);

      // on iOS the first call to netinfo returns null on the isInternetReachable field
      // we need to wait for the next call to get the correct value
      const retryResponse = yield* call(fetchNetInfoState());

      if (E.isRight(retryResponse)) {
        const retryIsAppConnected =
          retryResponse.right.isConnected === true &&
          retryResponse.right.isInternetReachable === true;

        yield* put(setConnectionStatus(retryIsAppConnected));
        return retryIsAppConnected;
      }
    }
    return false;
  } catch (e) {
    // do nothing. it should be a library error
    return false;
  }
}

/**
 * this saga requests and checks in loop connection status
 * if the connection is off app could show a warning message or avoid
 * the whole usage.
 */
export function* connectionStatusWatcherLoop() {
  // check connectivity status periodically
  while (true) {
    const response: SagaCallReturnType<typeof connectionStatusSaga> =
      yield* call(connectionStatusSaga);

    // if we have no connection increase rate
    if (response === false) {
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
      continue;
    }

    const isAppConnected = yield* select(isConnectedSelector);

    // if connection is off increase rate
    if (!isAppConnected) {
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
    } else {
      yield* call(startTimer, CONNECTIVITY_STATUS_LOAD_INTERVAL);
    }
  }
}

export default function* root(): IterableIterator<ReduxSagaEffect> {
  // configure net info library to check status and fetch a specific url
  configureNetInfo();
  yield* fork(connectionStatusWatcherLoop);
}
