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
import { fetchMaxRetries, fetchTimeout } from "../config";
import { Millisecond } from "italia-ts-commons/lib/units";
import { withRetries, TransientError } from "italia-ts-commons/lib/tasks";
import { fromEither } from "fp-ts/lib/TaskEither";
import { left, right } from "fp-ts/lib/Either";

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

// fetch client that can be aborted for timeout
const abortableFetch = AbortableFetch(fetch);
const timeoutFetch = toFetch(
  setFetchTimeout(1000 as Millisecond, abortableFetch)
);
// use a constant backoff
const constantBackoff = (delay: number) => () => delay as Millisecond;
const retryLogic = (maxRetries: number, delayBetweenRetriesMs: number) =>
  withRetries<Error, Response>(
    maxRetries,
    constantBackoff(delayBetweenRetriesMs)
  );
// makes the retry logic map 404s to transient errors (by default only
// timeouts are transient)
// see also https://github.com/teamdigitale/italia-ts-commons/blob/master/src/fetch.ts#L103
const retryWithTransient404s: typeof retryLogic = (
  retries: number,
  delay: number
) => (t, shouldAbort?) =>
  retryLogic(retries, delay)(
    // when the result of the task is a Response with status 404,
    // map it to a transient error
    t.chain(r =>
      fromEither(
        r.status === 404
          ? left<TransientError, never>(TransientError)
          : right<never, Response>(r)
      )
    ),
    shouldAbort
  );

// this is a fetch with timeouts, constant backoff and with the logic
// that handles 404s as transient errors, this "fetch" must be passed to
// createFetchRequestForApi when creating "getPaymentId"
export const pollingFetch = (retries: number, delay: number) =>
  retriableFetch(retryWithTransient404s(retries, delay))(timeoutFetch);
