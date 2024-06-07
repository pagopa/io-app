import { URL as PolyfillURL } from "react-native-url-polyfill";
import * as E from "fp-ts/lib/Either";
import {
  HttpCallConfig,
  HttpClientFailureResponse,
  HttpClientResponse,
  HttpClientSuccessResponse,
  isCancelledFailure,
  nativeRequest
} from "@pagopa/io-react-native-http-client";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { fimsGetRedirectUrlAndOpenIABAction } from "../store/actions";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import { LollipopConfig } from "../../lollipop";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../lollipop/store/reducers/lollipop";
import { generateKeyInfo } from "../../lollipop/saga";
import { lollipopRequestInit } from "../../lollipop/utils/fetch";
import { buildAbsoluteUrl, logToMixPanel } from "./sagaUtils";
import { handleFimsResourcesDeallocation } from "./handleFimsResourcesDeallocation";

// note: IAB => InAppBrowser

export function* handleFimsGetRedirectUrlAndOpenIAB(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenIABAction)["request"]>
) {
  const oidcProviderDomain = yield* select(fimsDomainSelector);
  if (!oidcProviderDomain) {
    logToMixPanel(`missing FIMS, domain is ${oidcProviderDomain}`);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure("missing FIMS domain")
    );
    return;
  }
  const maybeAcceptUrl = action.payload.acceptUrl;

  const acceptUrl = buildAbsoluteUrl(maybeAcceptUrl ?? "", oidcProviderDomain);
  if (!acceptUrl) {
    logToMixPanel(
      `unable to accept grants, could not buld url. obtained URL: ${maybeAcceptUrl}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "unable to accept grants: invalid URL"
      )
    );
    return;
  }

  const rpRedirectResponse = yield* call(
    recurseUntilRPUrl,
    { url: acceptUrl, verb: "post" },
    oidcProviderDomain
  );
  // --------------- lolliPoP -----------------

  if (rpRedirectResponse.type === "failure") {
    if (isCancelledFailure(rpRedirectResponse)) {
      return;
    }
    logToMixPanel(
      `could not get RelyingParty redirect URL, ${JSON.stringify(
        rpRedirectResponse
      )}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "could not get RelyingParty redirect URL"
      )
    );
    return;
  }
  const relyingPartyRedirectUrl = rpRedirectResponse.headers.location;

  const [authCode, lollipopNonce] = getQueryParamsFromUrlString(
    relyingPartyRedirectUrl
  );

  if (!authCode || !lollipopNonce) {
    logToMixPanel(
      `could not extract auth data from RelyingParty URL, auth code: ${!!authCode}, nonce: ${!!lollipopNonce}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "could not extract auth data from RelyingParty URL"
      )
    );
    return;
  }

  const lollipopConfig: LollipopConfig = {
    nonce: lollipopNonce,
    customContentToSign: {
      authorization_code: authCode
    }
  };

  const requestInit = { headers: {}, method: "GET" as const };

  const keyTag = yield* select(lollipopKeyTagSelector);
  const publicKey = yield* select(lollipopPublicKeySelector);
  const keyInfo = yield* call(generateKeyInfo, keyTag, publicKey);
  const lollipopEither = yield* call(
    nonThrowingLollipopRequestInit,
    lollipopConfig,
    keyInfo,
    relyingPartyRedirectUrl,
    requestInit
  );

  if (E.isLeft(lollipopEither)) {
    logToMixPanel(`could not sign request with LolliPoP`);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "could not sign request with LolliPoP"
      )
    );
    return;
  }
  const lollipopInit = lollipopEither.right;

  const inAppBrowserUrlResponse = yield* call(nativeRequest, {
    verb: "get",
    url: relyingPartyRedirectUrl,
    headers: lollipopInit.headers as Record<string, string>,
    followRedirects: false
  });

  if (isCancelledFailure(rpRedirectResponse)) {
    return;
  }

  const inAppBrowserRedirectUrl = extractValidRedirect(
    inAppBrowserUrlResponse,
    relyingPartyRedirectUrl
  );

  if (!inAppBrowserRedirectUrl) {
    logToMixPanel(
      `IAB url call failed or without a valid redirect, code: ${
        inAppBrowserUrlResponse.type === "failure"
          ? // eslint-disable-next-line sonarjs/no-nested-template-literals
            `${inAppBrowserUrlResponse.code}, message: ${inAppBrowserUrlResponse.message}`
          : inAppBrowserUrlResponse.status
      }`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "IAB url call failed or without a valid redirect"
      )
    );
    return;
  }

  // ----------------- end lolliPoP -----------------

  yield* put(fimsGetRedirectUrlAndOpenIABAction.success());
  yield* call(handleFimsResourcesDeallocation);
  return openAuthenticationSession(inAppBrowserRedirectUrl, "");
}

const recurseUntilRPUrl = async (
  httpClientConfig: HttpCallConfig,
  oidcDomain: string
): Promise<SuccessResponseWithLocationHeader | HttpClientFailureResponse> => {
  const res = await nativeRequest({
    ...httpClientConfig,
    followRedirects: false
  });

  const redirectUrl = extractValidRedirect(res, httpClientConfig.url);

  if (!redirectUrl) {
    if (res.type === "failure") {
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

  const isOIDCProviderBaseUrl = redirectUrl
    .toLowerCase()
    .startsWith(oidcDomain.toLowerCase());

  if (!isOIDCProviderBaseUrl) {
    return res as SuccessResponseWithLocationHeader;
  } else {
    return await recurseUntilRPUrl(
      {
        ...httpClientConfig,
        verb: "get",
        url: redirectUrl,
        followRedirects: false
      },
      oidcDomain
    );
  }
};

const extractValidRedirect = (
  data: HttpClientResponse,
  originalRequestUrl: string
) =>
  isValidRedirectResponse(data)
    ? buildAbsoluteUrl(data.headers.location, originalRequestUrl)
    : undefined;

const isValidRedirectResponse = (
  res: HttpClientResponse
): res is SuccessResponseWithLocationHeader =>
  res.type === "success" &&
  isRedirect(res.status) &&
  !!res.headers.location &&
  res.headers.location.trim().length > 0;

interface SuccessResponseWithLocationHeader extends HttpClientSuccessResponse {
  headers: {
    location: string;
  };
}

const getQueryParamsFromUrlString = (url: string) => {
  try {
    const constructedUrl = new PolyfillURL(url);
    const params = constructedUrl.searchParams;
    return [params.get("authorization_code"), params.get("nonce")];
  } catch (error) {
    return [undefined, undefined];
  }
};

const isRedirect = (statusCode: number) =>
  statusCode >= 300 && statusCode < 400;

const nonThrowingLollipopRequestInit = async (
  ...props: Parameters<typeof lollipopRequestInit>
) => {
  try {
    const res = await lollipopRequestInit(...props);
    return E.right(res);
  } catch (error) {
    return E.left(error);
  }
};
