import { put, PutEffect, take, TakeEffect } from "redux-saga/effects";
import { AsyncActionCreator, getType, PayloadAction } from "typesafe-actions";
import { Predicate } from "fp-ts/lib/function";

/**
 * execute an async action dispatching request and wait for the result.
 * If the result is successfully then the predicate will be executed to evaluate the result
 * otherwise false will be returned
 * @param action the action used to dispatch request and wait for success/failure
 * @param requestInput the input to give to action.request
 * @param predicate the predicate to execute in happy case (success)
 */
export function* getAsyncResult<T, I>(
  action: AsyncActionCreator<[any, I], [any, T], [any, Error]>,
  requestInput: I,
  predicate: Predicate<T>
): Generator<
  PutEffect | TakeEffect,
  boolean,
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
    return predicate(result.payload as T);
  }
  return false;
}
