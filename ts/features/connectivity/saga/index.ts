import * as E from "fp-ts/lib/Either";
import { call, fork, put } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { configureNetInfo, fetchNetInfoState } from "../utils";
import { startTimer } from "../../../utils/timer";
import { setConnectionStatus } from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";

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
  while (true) {
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

          // App is connected update the store and wait for the next check
          yield* put(setConnectionStatus(isAppConnected));

          if (isAppConnected) {
            yield* call(startTimer, CONNECTIVITY_STATUS_LOAD_INTERVAL);
            continue;
          }
          yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
          continue;
        }
        // if the response is not valid, wait for the next check
        // shortening the interval
        yield* call(startTimer, 500);
        continue;
      }
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
      continue;
    } catch (e) {
      yield* call(startTimer, CONNECTIVITY_STATUS_FAILURE_INTERVAL);
      continue;
    }
  }
}

export default function* root(): IterableIterator<ReduxSagaEffect> {
  // configure net info library to check status and fetch a specific url
  configureNetInfo();
  yield* fork(connectionStatusSaga);
}
