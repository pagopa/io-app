/**
 * This module exports an instance of fetch augmented with
 * timeout and retries with exponential backoff.
 */

import { left, right } from "fp-ts/lib/Either";
import { fromEither } from "fp-ts/lib/TaskEither";
import { calculateExponentialBackoffInterval } from "italia-ts-commons/lib/backoff";
import {
  AbortableFetch,
  retriableFetch,
  setFetchTimeout,
  toFetch
} from "italia-ts-commons/lib/fetch";
import { TransientError, withRetries } from "italia-ts-commons/lib/tasks";
import { Millisecond } from "italia-ts-commons/lib/units";
import { fetchMaxRetries, fetchPagoPaTimeout, fetchTimeout } from "../config";

/**
 * Returns a fetch wrapped with timeout and retry logic
 */
function retryingFetch(
  fetchApi: typeof fetch,
  timeout: Millisecond = fetchTimeout,
  maxRetries: number = fetchMaxRetries
): typeof fetch {
  // a fetch that can be aborted and that gets cancelled after fetchTimeoutMs
  const abortableFetch = AbortableFetch(fetchApi);
  const timeoutFetch = toFetch(setFetchTimeout(timeout, abortableFetch));

  // configure retry logic with default exponential backoff
  // @see https://github.com/teamdigitale/italia-ts-commons/blob/master/src/backoff.ts
  const exponentialBackoff = calculateExponentialBackoffInterval();
  const retryLogic = withRetries<Error, Response>(
    maxRetries,
    exponentialBackoff
  );
  return retriableFetch(retryLogic)(timeoutFetch);
}

/**
 * Default fetch configured with a short timeout and an exponential backoff
 * retrying strategy - suitable for calling the backend APIs that are supposed
 * to respond quickly.
 */
export function defaultRetryingFetch() {
  // Override default react-native fetch with whatwg's that supports aborting
  // tslint:disable-next-line:no-object-mutation
  (global as any).AbortController = require("abort-controller");
  require("./whatwg-fetch");

  return retryingFetch((global as any).fetch);
}

/**
 * A fetch configured with a much longer timeout than usual, suitable for
 * calling the PagoPA "verifica" and "attiva" operations that could take much
 * longer than normal APIs to respond (this depends on the public administration
 * system that PagoPA talks to).
 */
export function pagopaFetch() {
  // Override default react-native fetch with whatwg's that supports aborting
  // tslint:disable-next-line:no-object-mutation
  (global as any).AbortController = require("abort-controller");
  require("./whatwg-fetch");

  return retryingFetch((global as any).fetch, fetchPagoPaTimeout);
}

/**
 * This is a fetch with timeouts, constant backoff and with the logic
 * that handles 404s as transient errors, this "fetch" must be passed to
 * createFetchRequestForApi when creating "getPaymentId"
 */
export const constantPollingFetch = (
  retries: number,
  delay: number,
  timeout: Millisecond = 1000 as Millisecond
) => {
  // Override default react-native fetch with whatwg's that supports aborting
  // tslint:disable-next-line:no-object-mutation
  (global as any).AbortController = require("abort-controller");
  require("./whatwg-fetch");

  // fetch client that can be aborted for timeout
  const abortableFetch = AbortableFetch((global as any).fetch);
  const timeoutFetch = toFetch(setFetchTimeout(timeout, abortableFetch));
  // use a constant backoff
  const constantBackoff = () => delay as Millisecond;
  const retryLogic = withRetries<Error, Response>(retries, constantBackoff);
  // makes the retry logic map 404s to transient errors (by default only
  // timeouts are transient)
  // see also https://github.com/teamdigitale/italia-ts-commons/blob/master/src/fetch.ts#L103
  const retryWithTransient404s: typeof retryLogic = (t, shouldAbort?) =>
    retryLogic(
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

  return retriableFetch(retryWithTransient404s)(timeoutFetch);
};
