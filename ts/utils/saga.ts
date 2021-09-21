import { put, PutEffect, take, TakeEffect } from "redux-saga/effects";
import { AsyncActionCreator, getType, PayloadAction } from "typesafe-actions";
import { Either, left, right } from "fp-ts/lib/Either";

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
