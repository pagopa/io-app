import {
  deallocate,
  HttpCallConfig,
  HttpClientFailureResponse,
  HttpClientResponse,
  HttpClientSuccessResponse,
  nativeRequest,
  removeAllCookiesForDomain
} from "@pagopa/io-react-native-http-client";
import { pipe } from "fp-ts/lib/function";
import { URL as PolyfillURL } from "react-native-url-polyfill";
import { call, put, select } from "typed-redux-saga/macro";
import { StackActions } from "@react-navigation/native";
import { trackAuthenticationError } from "../../common/analytics";
import {
  fimsRelyingPartyDomainSelector,
  relyingPartyServiceIdSelector
} from "../store/selectors";
import { serviceDetailsByIdSelector } from "../../../services/details/store/selectors";
import { refreshSessionToken } from "../../../authentication/fastLogin/store/actions/tokenRefreshActions";
import NavigationService from "../../../../navigation/NavigationService";
import { oidcProviderDomainSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

export const absoluteRedirectUrlFromHttpClientResponse = (
  data: HttpClientResponse,
  originalRequestUrl: string
) =>
  isValidRedirectResponse(data)
    ? absoluteRedirectUrl(data.headers.location, originalRequestUrl)
    : undefined;

export const absoluteRedirectUrl = (
  redirect: string | undefined = undefined,
  originalRequestUrl: string
) => {
  if (!redirect) {
    return undefined;
  }
  try {
    const redirectUrl = new PolyfillURL(redirect);
    return redirectUrl.href;
  } catch (error) {
    try {
      const originalUrl = new PolyfillURL(originalRequestUrl);
      const origin = originalUrl.origin;
      const composedUrlString = redirect.startsWith("/")
        ? `${origin}${redirect}`
        : `${origin}/${redirect}`;
      const composedUrl = new PolyfillURL(composedUrlString);
      return composedUrl.href;
    } catch {
      return undefined;
    }
  }
};

export const getDomainFromUrl = (url: string) => {
  try {
    return new PolyfillURL(url).origin;
  } catch {
    return undefined;
  }
};

export const foldNativeHttpClientResponse =
  <T>(
    foldSuccess: (res: HttpClientSuccessResponse) => T,
    foldFailure: (res: HttpClientFailureResponse) => T
  ) =>
  (res: HttpClientResponse) => {
    switch (res.type) {
      case "success":
        return foldSuccess(res);
      default:
        return foldFailure(res);
    }
  };

export const formatHttpClientResponseForMixPanel = (
  resData: HttpClientResponse
) =>
  pipe(
    resData,
    foldNativeHttpClientResponse(
      success => `${success.type}, ${success.status}, ${success.body}`,
      failure => `${failure.type}, ${failure.code}, ${failure.message}`
    )
  );

export function* computeAndTrackAuthenticationError(reason: string) {
  const serviceIdOrUndefined = yield* select(relyingPartyServiceIdSelector);
  const serviceOrUndefined = serviceIdOrUndefined
    ? yield* select(serviceDetailsByIdSelector, serviceIdOrUndefined)
    : undefined;
  yield* call(
    trackAuthenticationError,
    serviceOrUndefined?.id,
    serviceOrUndefined?.name,
    serviceOrUndefined?.organization.name,
    serviceOrUndefined?.organization.fiscal_code,
    reason
  );
}

export const isValidRedirectResponse = (
  res: HttpClientResponse
): res is HttpClientSuccessResponse & {
  headers: { location: string };
} =>
  res.type === "success" &&
  isRedirectStatusCode(res.status) &&
  !!res.headers.location &&
  res.headers.location.trim().length > 0;

export const isSuccessfulStatusCode = (statusCode: number) =>
  statusCode >= 200 && statusCode < 300;
export const isRedirectStatusCode = (statusCode: number) =>
  statusCode >= 300 && statusCode < 400;
export const isFastLoginFailure = (res: HttpClientFailureResponse) =>
  res.code === 401;

// This method check for a generic 'json' substring since there are multiple
// formats that may identify json, like 'application/json', 'application/hal+json'
// 'application/ld+json'
export const responseContentContainsJson = (
  res: HttpClientResponse
): boolean => {
  const responseContentType = res.headers["content-type"]?.toLowerCase();
  return (
    typeof responseContentType === "string" &&
    (responseContentType.includes("application/json") ||
      responseContentType.includes("application/hal+json") ||
      responseContentType.includes("application/ld+json"))
  );
};

export const followProviderRedirects = async (
  httpClientConfig: HttpCallConfig,
  fimsDomain: string
): Promise<HttpClientResponse> => {
  const res = await nativeRequest({
    ...httpClientConfig,
    followRedirects: false
  });

  const redirectUrl = absoluteRedirectUrlFromHttpClientResponse(
    res,
    httpClientConfig.url
  );

  if (!redirectUrl) {
    if (res.type === "failure" || isSuccessfulStatusCode(res.status)) {
      return res;
    }
    // error case
    const response: HttpClientFailureResponse = {
      code: res.status,
      type: "failure",
      message: `malformed HTTP redirect response, location header value: ${res.headers.location}`,
      headers: res.headers
    };
    return response;
  }

  const isFIMSProviderBaseUrl = redirectUrl
    .toLowerCase()
    .startsWith(fimsDomain.toLowerCase());

  if (!isFIMSProviderBaseUrl) {
    return res;
  } else {
    return await followProviderRedirects(
      {
        ...httpClientConfig,
        verb: "get",
        url: redirectUrl,
        followRedirects: false
      },
      fimsDomain
    );
  }
};

export function* deallocateFimsAndRenewFastLoginSession() {
  yield* call(handleFimsResourcesDeallocation);
  yield* put(
    refreshSessionToken.request({
      showIdentificationModalAtStartup: false,
      showLoader: true,
      withUserInteraction: true
    })
  );
}

export function* handleFimsResourcesDeallocation() {
  const oidcProviderDomain = yield* select(oidcProviderDomainSelector);
  const relyingPartyDomain = yield* select(fimsRelyingPartyDomainSelector);
  if (oidcProviderDomain) {
    yield* call(removeAllCookiesForDomain, oidcProviderDomain);
  }
  if (relyingPartyDomain) {
    yield* call(removeAllCookiesForDomain, relyingPartyDomain);
  }
  yield* call(deallocate);
}

export function* handleFimsBackNavigation() {
  yield* call(NavigationService.dispatchNavigationAction, StackActions.pop());
}
