/**
 * Saga helper methods to call API endpoints with optional retry strategy in case of errors
 */

import { delay } from "redux-saga";
import { call, Effect } from "redux-saga/effects";

export interface IRetriesOptions {
  RETRIES: number;
  RETRIES_DELAY: number;
}

const defaultRetriesOptions = {
  RETRIES: 0,
  RETRIES_DELAY: 0
};

// tslint:disable-next-line
export function* callApi(apiRequest: any, ...rest: any[]): Iterator<Effect> {
  console.log("I am callApi");
  return yield call(
    callApiWithRetries,
    apiRequest,
    defaultRetriesOptions,
    ...rest
  );
}

export function* callApiWithRetries(
  apiRequest: any,
  retriesOptions: IRetriesOptions,
  // tslint:disable-next-line
  ...rest: any[]
): Iterator<Effect> {
  const { RETRIES, RETRIES_DELAY } = retriesOptions;
  // tslint:disable-next-line
  let response;

  // tslint:disable-next-line
  for (let i = 0; i <= RETRIES; i++) {
    // tslint:disable-next-line
    response = yield call(apiRequest, ...rest);
    if (response.ok) {
      break;
    } else {
      // TODO: Add a specific handler for HTTP 401 (token expired)
      if (i < RETRIES) {
        yield call(delay, RETRIES_DELAY);
      }
    }
  }

  return response;
}
