import * as Sentry from "@sentry/react-native";
import { call, delay, put, race, select, take } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../../types/utils";
import { selectItwEnv } from "../../common/store/selectors/environment.ts";
import { getEnv } from "../../common/utils/environment.ts";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwSetIntegrityServiceStatus } from "../../issuance/store/actions";
import { itwIntegrityServiceStatusSelector } from "../../issuance/store/selectors";

/**
 * Checks if the integrity service is ready by checking its current status and waiting for updates if needed.
 *
 * The integrity service can be in one of three states:
 * - "ready": The service is initialized and ready to use
 * - "unavailable": The device does not support the integrity service
 * - "error": An error occurred while initializing the service
 *
 * If the service is in an error state, this will trigger a warmup retry via warmUpIntegrityServiceSaga.
 * If the status is not conclusive, it will wait up to 10 seconds for the status to update.
 *
 * @returns true if the integrity service becomes ready within the timeout period, false otherwise
 */
export function* checkIntegrityServiceReadySaga(
  timeout: number = 10000
): Generator<ReduxSagaEffect, boolean> {
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
    timeout: delay(timeout)
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
  const env = getEnv(yield* select(selectItwEnv));

  try {
    const isReady: boolean = yield* call(ensureIntegrityServiceIsReady, env);
    yield* put(itwSetIntegrityServiceStatus(isReady ? "ready" : "unavailable"));
  } catch (e) {
    yield* put(itwSetIntegrityServiceStatus("error"));
    Sentry.captureException(e);
  }
}
