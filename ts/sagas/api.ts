import { Either } from "fp-ts/lib/Either";
import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { BasicResponseTypeWith401 } from "../api/backend";
import { sessionExpired } from "../store/actions/authentication";

/**
 * A generator that wrap an API Call and handle the response status.
 * If the response status is 401 the user must be logged out.
 */

export function* callApiWith401ResponseStatusHandler<
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

  if (response && response.status === 401) {
    yield put(sessionExpired);
  }
  return response;
}
