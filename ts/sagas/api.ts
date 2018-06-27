import { Either, left, right } from "fp-ts/lib/Either";
import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { BasicResponseTypeWith401 } from "../api/backend";
import { sessionExpired } from "../store/actions/authentication";

/**
 * A generator that wrap an API Call and handle the response status.
 * If the response status is 401 the user must be logged out.
 */
export function* callApi<
  P,
  RT,
  T extends Promise<BasicResponseTypeWith401<RT> | undefined>
>(
  apiCall: (param: P) => T,
  param: P
): IterableIterator<Effect | Either<Error, RT>> {
  const response: BasicResponseTypeWith401<RT> | undefined = yield call(
    apiCall,
    param
  );

  // Not able to decode the response
  if (!response) {
    return left(Error());
  } else if (response.status !== 200) {
    if (response.status === 401) {
      // If the response status is 401 the session is expired
      // Dispatch a SESSION_EXPIRED action
      yield put(sessionExpired());
    }
    return left(response.value);
  }
  return right(response.value);
}
