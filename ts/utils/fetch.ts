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
import { PublicKey, sign } from "@pagopa/io-react-native-crypto";
import { fetchMaxRetries, fetchTimeout } from "../config";
import {
  chainSignPromises,
  forgeSignatureComponents,
  getSignAlgorithm,
  LollipopConfig,
  SignPromiseResult
} from "../features/lollipop";
import { SignatureConfig } from "./httpSignature/types/SignatureConfig";
import { generateSignatureBase } from "./httpSignature/signature";
import { generateDigestHeader } from "./httpSignature/digest";
import { KeyInfo } from "./crypto";

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

/**
 * Decorates the current fetch with LolliPOP headers and http-signature
 */
export const lollipopFetch =
  (lollipopConfig: LollipopConfig, keyInfo: KeyInfo) =>
  (timeoutFetch: FixedFetch) =>
  (retriableFetch: (fetch: FixedFetch) => typeof fetch) =>
    retriableFetch((input: RequestInfo | URL, init?: RequestInit) => {
      const requestAndKeyInfo = isKeyInfoAndRquestValid(keyInfo, input, init);
      if (requestAndKeyInfo) {
        // eslint-disable-next-line functional/no-let
        let newInit = requestAndKeyInfo.init;
        const { body, bodyString, inputUrl, method, originalUrl } =
          extractHttpRequestComponents(
            requestAndKeyInfo.input,
            requestAndKeyInfo.init
          );
        if (body) {
          newInit = addHeader(
            newInit,
            "Content-Digest",
            generateDigestHeader(bodyString)
          );
        }
        const signatureConfigForgeInput: SignatureConfigForgeInput = {
          publicKey: requestAndKeyInfo.publicKey,
          keyTag: requestAndKeyInfo.keyTag,
          lollipopConfig,
          method,
          inputUrl,
          originalUrl
        };
        const mainSignatureConfig: SignatureConfig = forgeSignatureConfig(
          signatureConfigForgeInput,
          keyInfo,
          [
            "Content-Digest",
            "Content-Type",
            "x-pagopa-lollipop-original-method",
            "x-pagopa-lollipop-original-url"
          ]
        );
        newInit = addHeader(
          newInit,
          "x-pagopa-lollipop-original-method",
          method
        );
        newInit = addHeader(
          newInit,
          "x-pagopa-lollipop-original-url",
          originalUrl
        );
        const newInitHeaders =
          (newInit.headers as Record<string, string>) ?? {};
        const {
          signatureBase: mainSignatureBase,
          signatureInput: mainSignatureInput
        } = generateSignatureBase(newInitHeaders, mainSignatureConfig, 1);
        const customSignPromises: Array<Promise<SignPromiseResult>> =
          lollipopConfig.customSignatures?.map((headerValue, index) => {
            const headerIndex: number = index + 2;
            const headerName = `x-pagopa-lollipop-custom-${headerIndex}`;
            const customHeader = {
              [headerName]: headerValue
            };
            const customHeaderSignatureConfig: SignatureConfig =
              forgeSignatureConfig(signatureConfigForgeInput, keyInfo, [
                headerName
              ]);
            const {
              signatureBase: customSignatureBase,
              signatureInput: customSignatureInput
            } = generateSignatureBase(
              customHeader,
              customHeaderSignatureConfig,
              headerIndex
            );
            return sign(customSignatureBase, requestAndKeyInfo.keyTag).then(
              function (value) {
                return Promise.resolve({
                  headerIndex,
                  headerName,
                  headerValue,
                  signature: `sig${headerIndex}:${value}:`,
                  "signature-input": customSignatureInput
                });
              }
            );
          }) ?? [];

        return sign(mainSignatureBase, requestAndKeyInfo.keyTag)
          .then(function (mainSignValue) {
            return chainSignPromises(customSignPromises).then(function (
              customSignValues
            ) {
              // Add custom headers
              customSignValues.forEach(
                v => (newInit = addHeader(newInit, v.headerName, v.headerValue))
              );
              // Prepare custom signature inputs array
              const customSignatureInputs = customSignValues.map(
                v => v["signature-input"]
              );
              // Prepare custom signature array
              const customSignatures = customSignValues.map(v => v.signature);
              // Setup signature array
              const signatures = [
                `sig1:${mainSignValue}:`,
                ...customSignatures
              ];
              // Setup signature input array
              const signatureInputs = [
                mainSignatureInput,
                ...customSignatureInputs
              ];
              // Add all to their corresponding headers
              newInit = addHeader(newInit, "signature", signatures.join(","));
              newInit = addHeader(
                newInit,
                "signature-input",
                signatureInputs.join(",")
              );
              return timeoutFetch(input, newInit);
            });
          })
          .catch(function () {
            return timeoutFetch(input, init);
          });
      }
      return timeoutFetch(input, init);
    });

type SignatureConfigForgeInput = {
  publicKey: PublicKey;
  keyTag: string;
  lollipopConfig: LollipopConfig;
  method: string;
  inputUrl: URLParse;
  originalUrl: string;
};

function forgeSignatureConfig(
  forgeInput: SignatureConfigForgeInput,
  keyInfo: KeyInfo,
  signatureParams: Array<string>
): SignatureConfig {
  return {
    signAlgorithm: getSignAlgorithm(forgeInput.publicKey),
    signKeyTag: forgeInput.keyTag,
    signKeyId: keyInfo.publicKeyThumbprint ?? "",
    nonce: forgeInput.lollipopConfig.nonce,
    signatureComponents: forgeSignatureComponents(
      forgeInput.method,
      forgeInput.inputUrl,
      forgeInput.originalUrl
    ),
    signatureParams
  };
}

function extractHttpRequestComponents(input: string, init: RequestInit) {
  const inputUrl = new URLParse(input, true);
  const queryString: string | undefined = inputUrl.href.split("?")[1];
  const method = init.method?.toUpperCase() ?? "";
  const body = init.body;
  const bodyString = body as string;
  const originalUrl =
    inputUrl.pathname + (queryString ? "?" + queryString : "");
  return { body, bodyString, inputUrl, queryString, method, originalUrl };
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
 * Check if the keyInfo and Request properties are properly initialized for fetching
 */
function isKeyInfoAndRquestValid(
  keyInfo: KeyInfo,
  input: RequestInfo | URL,
  init?: RequestInit
): RequestAndKeyInfoForLPFetch | undefined {
  return keyInfo.publicKey &&
    keyInfo.keyTag &&
    typeof input === "string" &&
    init?.headers &&
    init?.method
    ? {
        publicKey: keyInfo.publicKey,
        keyTag: keyInfo.keyTag,
        input,
        init,
        headers: init.headers,
        method: init.method
      }
    : undefined;
}

type RequestAndKeyInfoForLPFetch = {
  publicKey: PublicKey;
  keyTag: string;
  input: string;
  init: RequestInit;
  headers: HeadersInit;
  method: string;
};
