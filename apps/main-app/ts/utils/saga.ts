import { put, take } from "typed-redux-saga/macro";
import { AsyncActionCreator, getType, PayloadAction } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";

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
) {
  yield* put(action.request(requestInput));
  const successType = getType(action.success);
  const failureType = getType(action.failure);
  const result = yield* take<PayloadAction<any, T> | PayloadAction<any, Error>>(
    [successType, failureType]
  );
  if (result.type === successType) {
    return E.right<Error, T>(result.payload as T);
  }
  return E.left<Error, T>(result.payload as Error);
}
