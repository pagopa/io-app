/**
 * This module exports an instance of fetch augmented with
 * timeout and retries with exponential backoff.
 */

import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { calculateExponentialBackoffInterval } from "@pagopa/ts-commons/lib/backoff";
import {
  AbortableFetch,
  retriableFetch,
  setFetchTimeout,
  toFetch
} from "@pagopa/ts-commons/lib/fetch";
import {
  RetriableTask,
  TransientError,
  withRetries
} from "@pagopa/ts-commons/lib/tasks";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import { fetchMaxRetries, fetchTimeout } from "../config";
// FIXME: This is a temporary type created to avoid
// a compilation error caused by the `toFetch` function
// not returning a function with the `input` parameter
// typed as `RequestInfo | URL`, which is the correct
// type for the `fetch` method.
type FixedFetch = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => Promise<Response>;

export function toFetchTimeout(timeout: Millisecond = fetchTimeout) {
  const fetchApi = (global as any).fetch;
  const abortableFetch = AbortableFetch(fetchApi);
  return toFetch(setFetchTimeout(timeout, abortableFetch)) as FixedFetch;
}

export function toRetriableFetch(
  maxRetries: number = fetchMaxRetries,
  retryOnStatusCode: number = 429,
  backoff: (n: number) => Millisecond = calculateExponentialBackoffInterval(),
  shouldAbort?: Promise<boolean>
): (fetch: FixedFetch) => typeof fetch {
  // configure retry logic with default exponential backoff
  // @see https://github.com/pagopa/io-ts-commons/blob/master/src/backoff.ts
  const retryLogic = withRetries<Error, Response>(maxRetries, backoff);
  const retryWithTransient = retryLogicForTransientResponseError(
    _ => _.status === retryOnStatusCode,
    retryLogic
  );

  return retriableFetch(retryWithTransient, shouldAbort);
}

/**
 * Wrapper for the Fetch API configured by default with a short timeout and
 * an exponential backoff retrying strategy.
 * Suitable for calling the backend APIs that are supposed
 * to respond quickly.
 *
 * Note that the retry is applied only upon receiving error "429 Too Many Requests".
 * Timeout and max retries act as circuit breakers.
 */
export function defaultRetryingFetch(
  timeout: Millisecond = fetchTimeout,
  maxRetries: number = fetchMaxRetries
): typeof fetch {
  const timeoutFetch = toFetchTimeout(timeout);
  const retriableFetch = toRetriableFetch(maxRetries, 429);

  return retriableFetch((input: RequestInfo | URL, init?: RequestInit) =>
    timeoutFetch(input, init)
  );
}

/**
 * Fetch with transient error handling.
 * Handle error that occurs once or at unpredictable intervals.
 */
function retryLogicForTransientResponseError(
  p: (r: Response) => boolean,
  retryLogic: (
    t: RetriableTask<Error, Response>,
    shouldAbort?: Promise<boolean>
  ) => TE.TaskEither<Error | "max-retries" | "retry-aborted", Response>
): typeof retryLogic {
  return (t: RetriableTask<Error, Response>, shouldAbort?: Promise<boolean>) =>
    retryLogic(
      // when the result of the task is a Response that satisfies
      // the predicate p, map it to a transient error
      pipe(
        t,
        TE.chainW((r: any) =>
          TE.fromEither(p(r) ? E.left(TransientError) : E.right(r))
        )
      ),
      shouldAbort
    );
}

/**
 * This is a fetch with timeout for single request, constant backoff, and
 * the logic to handle 404s as transient errors.
 */
export const constantPollingFetch = (
  shouldAbort: Promise<boolean>,
  retries: number,
  delay: number,
  timeout: Millisecond = fetchTimeout
): typeof fetch => {
  const constantBackoff = () => delay as Millisecond;
  const timeoutFetch = toFetchTimeout(timeout);
  const retriableFetch = toRetriableFetch(
    retries,
    404,
    constantBackoff,
    shouldAbort
  );

  return retriableFetch(timeoutFetch);
};
