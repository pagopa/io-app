import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { call, delay, select } from "typed-redux-saga/macro";
import { backOffWaitingTime } from "../store/reducers/backoffError";
import { mixpanelTrack } from "../mixpanel";
import { FailureActions } from "../store/reducers/backoffErrorConfig";
import { ReduxSagaEffect } from "../types/utils";

/**
 * return the backoff waiting time from the given failure action
 * @param failure
 */
export function* getBackoffTime(
  failure: FailureActions
): Generator<
  ReduxSagaEffect,
  Millisecond,
  (failure: FailureActions) => Millisecond
> {
  const computeDelay: ReturnType<typeof backOffWaitingTime> = yield* select(
    backOffWaitingTime
  );
  const delay = computeDelay(failure);
  void mixpanelTrack("GET_BACKOFF_TIME", {
    action: failure.toString(),
    delay
  });
  return delay;
}

/**
 * select and wait the backoff time from a given failure action
 * @param failure
 */
export function* waitBackoffError(failure: FailureActions) {
  const delayTime: Millisecond = yield* call(getBackoffTime, failure);
  if (delayTime > 0) {
    yield* delay(delayTime);
  }
}
