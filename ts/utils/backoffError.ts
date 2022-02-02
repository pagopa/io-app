import { Millisecond } from "italia-ts-commons/lib/units";
import { call, delay, select, SelectEffect } from "typed-redux-saga";
import {
  backOffWaitingTime,
  FailureActions
} from "../store/reducers/backoffError";
import { mixpanelTrack } from "../mixpanel";

/**
 * return the backoff waiting time from the given failure action
 * @param failure
 */
export function* getBackoffTime(
  failure: FailureActions
): Generator<
  SelectEffect,
  Millisecond,
  (failure: FailureActions) => Millisecond
> {
  const computeDelay: ReturnType<typeof backOffWaitingTime> = yield select(
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
  const delayTime: Millisecond = yield call(getBackoffTime, failure);
  if (delayTime > 0) {
    yield delay(delayTime);
  }
}
