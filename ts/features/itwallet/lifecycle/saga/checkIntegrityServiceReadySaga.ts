import { call, delay, put, race, select, take } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../../types/utils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwSetIntegrityServiceStatus } from "../../issuance/store/actions";
import { itwIntegrityServiceStatusSelector } from "../../issuance/store/selectors";

export function* checkIntegrityServiceReadySaga(): Generator<
  ReduxSagaEffect,
  boolean
> {
  const integrityServiceStatus = yield* select(
    itwIntegrityServiceStatusSelector
  );

  // If integrity service is ready means we can continue
  if (integrityServiceStatus === "ready") {
    return true;
  }

  // If integrity service is unavailable means the device does not support it
  if (integrityServiceStatus === "unavailable") {
    return false;
  }

  // If integrity service is in error state, retry warming it up
  if (integrityServiceStatus === "error") {
    yield* call(warmUpIntegrityServiceSaga);
  }

  // Wait for the integrity service status to be updated up to 10 seconds
  const { result } = yield* race({
    result: take(itwSetIntegrityServiceStatus),
    timeout: delay(10000)
  });

  return result?.payload === "ready" ?? false;
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
