import {
  cancelAllRunningRequests,
  isFailureResponse,
  nativeRequest
} from "@pagopa/io-react-native-http-client";
import { call, select } from "typed-redux-saga/macro";
import { oidcProviderDomainSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { fimsPartialAbortUrl } from "../store/selectors";
import {
  absoluteRedirectUrl,
  computeAndTrackAuthenticationError,
  handleFimsBackNavigation,
  formatHttpClientResponseForMixPanel,
  handleFimsResourcesDeallocation
} from "./sagaUtils";

const abortTimeoutMillisecondsGenerator = () => 8000;

export function* handleFimsAbortOrCancel() {
  yield* call(cancelAllRunningRequests);
  const oidcProviderDomain = yield* select(oidcProviderDomainSelector);
  const abortUrlMaybePartial = yield* select(fimsPartialAbortUrl);
  if (oidcProviderDomain && abortUrlMaybePartial) {
    const abortAbsoluteUrl = yield* call(
      absoluteRedirectUrl,
      abortUrlMaybePartial,
      oidcProviderDomain
    );
    if (abortAbsoluteUrl) {
      const abortResponse = yield* call(nativeRequest, {
        url: abortAbsoluteUrl,
        verb: "post",
        followRedirects: true,
        timeoutMilliseconds: abortTimeoutMillisecondsGenerator()
      });
      if (isFailureResponse(abortResponse)) {
        yield* call(
          computeAndTrackAuthenticationError,
          `Abort call failed: ${formatHttpClientResponseForMixPanel(
            abortResponse
          )}`
        );
      }
    } else {
      yield* call(
        computeAndTrackAuthenticationError,
        `Unable to compose absolute Abort call url: ${abortUrlMaybePartial}`
      );
    }
  }

  yield* call(handleFimsResourcesDeallocation);
  yield* call(handleFimsBackNavigation);
}
