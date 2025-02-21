import { call, delay, put, race, select, take } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../../types/utils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwSetIntegrityServiceStatus } from "../../issuance/store/actions";
import { itwIntegrityServiceStatusSelector } from "../../issuance/store/selectors";

export function* checkAndWaitForIntegrityServiceSaga(): Generator<
  ReduxSagaEffect,
  boolean
> {
  const { result } = yield* race({
    result: call(function* () {
      while (true) {
        switch (yield* select(itwIntegrityServiceStatusSelector)) {
          case "ready":
            // If integrity service is ready means we can continue
            return true;

          case "unavailable":
            // If integrity service is unavailable means the device does not support it
            return false;

          case "error":
            // If integrity service is in error state, retry warming it up
            yield* call(warmUpIntegrityServiceSaga);
            yield* take(itwSetIntegrityServiceStatus);
            break;

          case undefined:
            // We are still waiting for the integrity service warm up
            yield* take(itwSetIntegrityServiceStatus);
            break;
        }
      }
    }),
    timeout: delay(10000) // We stop checking if integrity service is not ready after 10 seconds
  });
  return result ?? false;
}

/**
 * Saga responsible to check whether the integrity service is ready.
 * Works as a warmup process for the integrity service on Android.
 */
export function* warmUpIntegrityServiceSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  try {
    const isReady: boolean = yield* call(ensureIntegrityServiceIsReady);
    yield* put(itwSetIntegrityServiceStatus(isReady ? "ready" : "unavailable"));
  } catch (e) {
    yield* put(itwSetIntegrityServiceStatus("error"));
  }
}
