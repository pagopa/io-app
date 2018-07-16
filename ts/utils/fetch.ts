/**
 * This module exports an instance of fetch augmented with
 * timeout and retries with exponential backoff.
 */

import { calculateExponentialBackoffInterval } from "italia-ts-commons/lib/backoff";
import {
  AbortableFetch,
  retriableFetch,
  setFetchTimeout,
  toFetch
} from "italia-ts-commons/lib/fetch";
import { withRetries } from "italia-ts-commons/lib/tasks";
import { fetchMaxRetries, fetchTimeout } from "../config";

/**
 * Returns a fetch wrapped with timeout and retry logic
 */
export function retryingFetch(fetchApi: typeof fetch): typeof fetch {
  // a fetch that can be aborted and that gets cancelled after fetchTimeoutMs
  const abortableFetch = AbortableFetch(fetchApi);
  const timeoutFetch = toFetch(setFetchTimeout(fetchTimeout, abortableFetch));

  // configure retry logic with default exponential backoff
  // @see https://github.com/teamdigitale/italia-ts-commons/blob/master/src/backoff.ts
  const exponentialBackoff = calculateExponentialBackoffInterval();
  const retryLogic = withRetries<Error, Response>(
    fetchMaxRetries,
    exponentialBackoff
  );
  return retriableFetch(retryLogic)(timeoutFetch);
}

export function defaultRetryingFetch() {
  // tslint:disable-next-line:no-object-mutation
  (global as any).AbortController = require("abort-controller");
  require("./whatwg-fetch");
  return retryingFetch((global as any).fetch);
}
