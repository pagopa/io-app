/**
 * Saga helper methods to call API endpoints with optional retry strategy in case of errors
 */

import { delay } from "redux-saga";
import { call, Effect } from "redux-saga/effects";

import { apiDefaultMaxRetries, apiDefaultRetriesDelayMs } from "../../config";

export interface IRetriesOptions {
  MAX_RETRIES: number;
  RETRIES_DELAY_MS: number;
}

const defaultRetriesOptions = {
  MAX_RETRIES: apiDefaultMaxRetries,
  RETRIES_DELAY_MS: apiDefaultRetriesDelayMs
};

// tslint:disable-next-line
export function* callApi(apiRequest: any, ...rest: any[]): Iterator<Effect> {
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
  const { MAX_RETRIES, RETRIES_DELAY_MS } = retriesOptions;
  // tslint:disable-next-line
  let response;

  // tslint:disable-next-line
  for (let i = 0; i <= MAX_RETRIES; i++) {
    // tslint:disable-next-line
    response = yield call(apiRequest, ...rest);
    if (response.ok) {
      break;
    } else {
      // TODO: Add a specific handler for HTTP 401 (token expired)
      // https://www.pivotaltracker.com/story/show/157509296
      if (i < MAX_RETRIES) {
        yield call(delay, RETRIES_DELAY_MS);
      }
    }
  }

  return response;
}
