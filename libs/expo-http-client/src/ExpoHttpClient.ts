import type {
  HttpCallConfig,
  HttpClientResponse
} from "./ExpoHttpClient.types";

import ExpoHttpClientModule from "./ExpoHttpClientModule";

const unsupportedPlatformError = () =>
  new Error("ExpoHttpClient is only available on iOS and Android.");

const getNativeModule = () => {
  if (!ExpoHttpClientModule) {
    throw unsupportedPlatformError();
  }
  return ExpoHttpClientModule;
};

/**
 * Sends an HTTP request through the native client, which shares its in-memory
 * cookie storage with the other functions of this module.
 *
 * The promise resolves for every network outcome: HTTP errors (status >= 400)
 * and non-HTTP failures (bad configuration, timeout, cancellation, TLS,
 * serialization) are returned as `HttpClientFailureResponse`, the latter with
 * code `NonHttpErrorCode`.
 *
 * @throws Rejects if invoked on a platform other than iOS or Android.
 */
export const nativeRequest = async (
  config: HttpCallConfig
): Promise<HttpClientResponse> => getNativeModule().nativeRequest(config);

/** @throws If invoked on a platform other than iOS or Android. */
export const setCookie = (
  domain: string,
  path: string,
  name: string,
  value: string
): void => getNativeModule().setCookieForDomain(domain, path, name, value);

/** @throws If invoked on a platform other than iOS or Android. */
export const removeAllCookiesForDomain = (domain: string): void =>
  getNativeModule().removeAllCookiesForDomain(domain);

/**
 * Cancels the running request with the given `requestId`: its promise resolves
 * with a failure matched by `isCancelledFailure`. Natively it is queued after
 * any previous `nativeRequest` call, so it always finds that request.
 *
 * @throws If invoked on a platform other than iOS or Android.
 */
export const cancelRequestWithId = (requestId: string): void =>
  void getNativeModule().cancelRequestWithId(requestId);

/**
 * Natively queued after any previous `nativeRequest` call, like
 * `cancelRequestWithId`.
 *
 * @throws If invoked on a platform other than iOS or Android.
 */
export const cancelAllRunningRequests = (): void =>
  void getNativeModule().cancelAllRunningRequests();

/**
 * Cancels all running requests and releases the native clients. On Android it
 * also clears the in-memory cookie storage.
 *
 * @throws If invoked on a platform other than iOS or Android.
 */
export const deallocate = (): void => void getNativeModule().deallocate();
