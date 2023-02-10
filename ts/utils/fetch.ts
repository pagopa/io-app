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
import URLParse from "url-parse";
import { sign } from "@pagopa/io-react-native-crypto";
import { fetchMaxRetries, fetchTimeout } from "../config";
import { SignatureConfig } from "./httpSignature/types/SignatureConfig";
import { generateSignatureBase } from "./httpSignature/signature";
import { KeyInfo } from "./crypto";
import { generateDigestHeader } from "./httpSignature/digest";

// FIXME: This is a temporary type created to avoid
// a compilation error caused by the `toFetch` function
// not returning a function with the `input` parameter
// typed as `RequestInfo | URL`, which is the correct
// type for the `fetch` method.
type FixedFetch = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => Promise<Response>;

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
  maxRetries: number = fetchMaxRetries,
  keyInfo?: KeyInfo
): typeof fetch {
  const fetchApi = (global as any).fetch;
  const abortableFetch = AbortableFetch(fetchApi);
  const timeoutFetch = toFetch(
    setFetchTimeout(timeout, abortableFetch)
  ) as FixedFetch;
  // configure retry logic with default exponential backoff
  // @see https://github.com/pagopa/io-ts-commons/blob/master/src/backoff.ts
  const exponentialBackoff = calculateExponentialBackoffInterval();
  const retryLogic = withRetries<Error, Response>(
    maxRetries,
    exponentialBackoff
  );
  const retryWithTransient429s = retryLogicForTransientResponseError(
    _ => _.status === 429,
    retryLogic
  );
  return retriableFetch(retryWithTransient429s)(
    (input: RequestInfo | URL, init?: RequestInit) => {
      if (keyInfo) {
        return signFetchWithLollipop(input, init, keyInfo, timeoutFetch);
      } else {
        return timeoutFetch(input, init);
      }
    }
  );
}

/**
 * Decorates the current fetch with LolliPOP headers and http-signature
 */
function signFetchWithLollipop(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  keyInfo: KeyInfo,
  wrappableFetch: FixedFetch
) {
  // eslint-disable-next-line functional/no-let
  if (!JSON.stringify(input).includes("backend.json")) {
    const { keyTag, publicKey } = keyInfo;
    if (
      keyTag &&
      publicKey &&
      typeof input === "string" &&
      init &&
      "headers" in init &&
      init.headers &&
      "method" in init &&
      init.method
    ) {
      // eslint-disable-next-line functional/no-let
      let newInit = init;
      const inputUrl = new URLParse(input, true);
      const queryString: string | undefined = inputUrl.href.split("?")[1];
      const method = init.method.toUpperCase();
      const body = init.body;
      const bodyString = body as string;
      if (body) {
        const bodySize = Buffer.byteLength(bodyString);
        newInit = addHeader(
          newInit,
          "Content-Digest",
          generateDigestHeader(bodyString)
        );
        newInit = addHeader(newInit, "Content-Length", bodySize);
      }
      const originalUrl =
        inputUrl.pathname + (queryString ? "?" + queryString : "");
      const signatureConfig: SignatureConfig = {
        signAlgorithm:
          publicKey?.kty === "EC" ? "ecdsa-p256-sha256" : "rsa-pss-sha256",
        signKeyTag: keyTag,
        signKeyId: "AF2G87coad7/KJl9800==",
        nonce: "xyz",
        signatureComponents: {
          method,
          authority: inputUrl.hostname,
          path: inputUrl.pathname,
          requestTarget: originalUrl,
          scheme: inputUrl.protocol,
          targetUri: `${inputUrl.protocol}://${inputUrl.hostname}/${originalUrl}`
        },
        signatureParams: [
          "Content-Digest",
          "Content-Type",
          "Content-Length",
          "x-pagopa-lollipop-original-method",
          "x-pagopa-lollipop-original-url"
        ]
      };
      newInit = addHeader(newInit, "x-pagopa-lollipop-original-method", method);
      newInit = addHeader(
        newInit,
        "x-pagopa-lollipop-original-url",
        originalUrl
      );
      const newInitHeaders = (newInit.headers as Record<string, string>) ?? {};
      const { signatureBase, signatureInput } = generateSignatureBase(
        newInitHeaders,
        signatureConfig
      );
      return sign(signatureBase, keyTag)
        .then(function (value) {
          // eslint-disable-next-line no-console
          newInit = addHeader(newInit, "signature", `sig1:${value}:`);
          newInit = addHeader(newInit, "signature-input", signatureInput);
          // TODO: - put all this in an utility function
          // eslint-disable-next-line no-console
          console.log("✅🚀" + JSON.stringify(newInit.headers));
          return wrappableFetch(input, newInit);
        })
        .catch(function () {
          return wrappableFetch(input, init);
        });
    }
    return wrappableFetch(input, init);
  }
  return wrappableFetch(input, init);
}

/**
 * Add a pair header:value to the current fetch init.headers.
 */
function addHeader(
  init: RequestInit,
  headerName: string,
  headerValue: string | number
) {
  return {
    ...init,
    headers: {
      ...init.headers,
      [headerName]: headerValue
    }
  };
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
  const abortableFetch = AbortableFetch((global as any).fetch);
  const timeoutFetch = toFetch(
    setFetchTimeout(timeout, abortableFetch)
  ) as FixedFetch;
  const constantBackoff = () => delay as Millisecond;
  const retryLogic = withRetries<Error, Response>(retries, constantBackoff);
  // makes the retry logic map 404s to transient errors (by default only
  // timeouts are transient)
  // see also https://github.com/pagopa/io-ts-commons/blob/master/src/fetch.ts#L103
  const retryWithTransient404s = retryLogicForTransientResponseError(
    _ => _.status === 404,
    retryLogic
  );

  return retriableFetch(retryWithTransient404s, shouldAbort)(timeoutFetch);
};
