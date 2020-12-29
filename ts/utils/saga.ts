import {
  call,
  delay,
  put,
  PutEffect,
  select,
  SelectEffect,
  take,
  TakeEffect
} from "redux-saga/effects";
import { AsyncActionCreator, getType, PayloadAction } from "typesafe-actions";
import { Either, left, right } from "fp-ts/lib/Either";
import { Millisecond } from "italia-ts-commons/lib/units";
import { mixpanelTrack } from "../mixpanel";
import {
  backOffWaitingTime,
  FailureActions
} from "../store/reducers/wallet/lastRequestError";

/**
 * execute an async action dispatching request and wait for the result.
 * If the action ends successfully it return right(value) otherwise left(error)
 * otherwise false will be returned (failure case)
 * @param action the action used to dispatch request and wait for success/failure
 * @param requestInput the input to give to action.request
 */
export function* getAsyncResult<T, I>(
  action: AsyncActionCreator<[any, I], [any, T], [any, Error]>,
  requestInput: I
): Generator<
  PutEffect | TakeEffect,
  Either<Error, T>,
  PayloadAction<any, T> | PayloadAction<any, Error>
> {
  yield put(action.request(requestInput));
  const successType = getType(action.success);
  const failureType = getType(action.failure);
  const result: PayloadAction<any, T> | PayloadAction<any, Error> = yield take([
    successType,
    failureType
  ]);
  if (result.type === successType) {
    return right<Error, T>(result.payload as T);
  }
  return left<Error, T>(result.payload as Error);
}

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
export function* backoffWait(failure: FailureActions) {
  const delayTime: Millisecond = yield call(getBackoffTime, failure);
  if (delayTime > 0) {
    yield delay(delayTime);
  }
}
