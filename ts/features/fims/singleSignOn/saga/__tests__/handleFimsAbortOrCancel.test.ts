import {
  cancelAllRunningRequests,
  HttpClientFailureResponse,
  HttpClientSuccessResponse,
  nativeRequest
} from "@pagopa/io-react-native-http-client";
import { testSaga } from "redux-saga-test-plan";
import { oidcProviderDomainSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { fimsPartialAbortUrl } from "../../store/selectors";
import { handleFimsAbortOrCancel } from "../handleFimsAbortOrCancel";
import {
  absoluteRedirectUrl,
  computeAndTrackAuthenticationError,
  formatHttpClientResponseForMixPanel,
  handleFimsBackNavigation,
  handleFimsResourcesDeallocation
} from "../sagaUtils";

const abortTimeoutMillisecondsGenerator: number = 8000;

describe("handleFimsAbortOrCancel", () => {
  const mockedOidcProviderDomain = "https://provider.com";
  const mockedPartialAbortUrl = "/abort";
  const mockedAbsoluteUrl = "https://provider.com/abort";

  it("should call nativeRequest if oidcProviderDomain and abort url are defined and log error if request fails", () => {
    const failureResponse: HttpClientFailureResponse = {
      type: "failure",
      code: 500,
      message: "Server Error",
      headers: {}
    };

    const formattedError = formatHttpClientResponseForMixPanel(failureResponse);

    testSaga(handleFimsAbortOrCancel)
      .next()
      .call(cancelAllRunningRequests)

      .next()
      .select(oidcProviderDomainSelector)
      .next(mockedOidcProviderDomain)

      .select(fimsPartialAbortUrl)
      .next(mockedPartialAbortUrl)

      .call(
        absoluteRedirectUrl,
        mockedPartialAbortUrl,
        mockedOidcProviderDomain
      )
      .next(mockedAbsoluteUrl)

      .call(nativeRequest, {
        url: mockedAbsoluteUrl,
        verb: "post",
        followRedirects: true,
        timeoutMilliseconds: abortTimeoutMillisecondsGenerator
      })
      .next(failureResponse)

      .call(
        computeAndTrackAuthenticationError,
        `Abort call failed: ${formattedError}`
      )

      .next()
      .call(handleFimsResourcesDeallocation)

      .next()
      .call(handleFimsBackNavigation)

      .next()
      .isDone();
  });

  it("should handle missing absolute redirect url", () => {
    testSaga(handleFimsAbortOrCancel)
      .next()
      .call(cancelAllRunningRequests)

      .next()
      .select(oidcProviderDomainSelector)
      .next(mockedOidcProviderDomain)

      .select(fimsPartialAbortUrl)
      .next(mockedPartialAbortUrl)

      .call(
        absoluteRedirectUrl,
        mockedPartialAbortUrl,
        mockedOidcProviderDomain
      )
      .next(undefined)

      .call(
        computeAndTrackAuthenticationError,
        `Unable to compose absolute Abort call url: ${mockedPartialAbortUrl}`
      )

      .next()
      .call(handleFimsResourcesDeallocation)

      .next()
      .call(handleFimsBackNavigation)

      .next()
      .isDone();
  });

  it("should skip abort call if oidcProviderDomain and abortUrl are both missing", () => {
    testSaga(handleFimsAbortOrCancel)
      .next()
      .call(cancelAllRunningRequests)

      .next()
      .select(oidcProviderDomainSelector)
      .next(undefined)

      .select(fimsPartialAbortUrl)
      .next(undefined)

      .call(handleFimsResourcesDeallocation)

      .next()
      .call(handleFimsBackNavigation)

      .next()
      .isDone();
  });

  it("should skip abort call if oidcProviderDomain is missing but abortUrl is defined", () => {
    testSaga(handleFimsAbortOrCancel)
      .next()
      .call(cancelAllRunningRequests)

      .next()
      .select(oidcProviderDomainSelector)
      .next(undefined)

      .select(fimsPartialAbortUrl)
      .next(mockedPartialAbortUrl)

      .call(handleFimsResourcesDeallocation)

      .next()
      .call(handleFimsBackNavigation)

      .next()
      .isDone();
  });

  it("should skip abort call if abortUrl is missing but oidcProviderDomain is defined", () => {
    testSaga(handleFimsAbortOrCancel)
      .next()
      .call(cancelAllRunningRequests)

      .next()
      .select(oidcProviderDomainSelector)
      .next(mockedOidcProviderDomain)

      .select(fimsPartialAbortUrl)
      .next(undefined)

      .call(handleFimsResourcesDeallocation)

      .next()
      .call(handleFimsBackNavigation)

      .next()
      .isDone();
  });

  it("should complete successfully when nativeRequest returns success", () => {
    const successResponse: HttpClientSuccessResponse = {
      type: "success",
      status: 200,
      body: "ok",
      headers: {}
    };

    testSaga(handleFimsAbortOrCancel)
      .next()
      .call(cancelAllRunningRequests)

      .next()
      .select(oidcProviderDomainSelector)
      .next(mockedOidcProviderDomain)

      .select(fimsPartialAbortUrl)
      .next(mockedPartialAbortUrl)

      .call(
        absoluteRedirectUrl,
        mockedPartialAbortUrl,
        mockedOidcProviderDomain
      )
      .next(mockedAbsoluteUrl)

      .call(nativeRequest, {
        url: mockedAbsoluteUrl,
        verb: "post",
        followRedirects: true,
        timeoutMilliseconds: abortTimeoutMillisecondsGenerator
      })
      .next(successResponse)

      .call(handleFimsResourcesDeallocation)

      .next()
      .call(handleFimsBackNavigation)

      .next()
      .isDone();
  });
});
