import {
  URL as PolyfillURL,
  URLSearchParams as PolyfillURLSearchParams
} from "react-native-url-polyfill";
import { Parser as HTMLParser2 } from "htmlparser2";
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
import { ReduxSagaEffect } from "../../../../types/utils";
import { fimsGetRedirectUrlAndOpenIABAction } from "../store/actions";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus";
import { LollipopConfig } from "../../../lollipop";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../../lollipop/store/reducers/lollipop";
import { generateKeyInfo } from "../../../lollipop/saga";
import { lollipopRequestInit } from "../../../lollipop/utils/fetch";
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

  const inAppBrowserUrlResponseWrapper = isRedirect(rpRedirectResponse.status)
    ? yield* call(
        redirectToRelyingPartyWithAuthorizationCodeFlow,
        rpRedirectResponse
      )
    : yield* call(postToRelyingPartyWithImplicitCodeFlow, rpRedirectResponse);
  if (!inAppBrowserUrlResponseWrapper) {
    // Error and cancellation have already been handled
    return;
  }

  const relyingPartyRedirectUrl =
    inAppBrowserUrlResponseWrapper.relyingPartyUrl;
  const inAppBrowserUrlResponse = inAppBrowserUrlResponseWrapper.response;
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
  return openAuthenticationSession(inAppBrowserRedirectUrl, "", true);
}

const recurseUntilRPUrl = async (
  httpClientConfig: HttpCallConfig,
  oidcDomain: string
): Promise<HttpClientResponse> => {
  const res = await nativeRequest({
    ...httpClientConfig,
    followRedirects: false
  });

  const redirectUrl = extractValidRedirect(res, httpClientConfig.url);

  if (!redirectUrl) {
    if (res.type === "failure") {
      return res;
    }
    if (res.status >= 200 && res.status < 300) {
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
    return res;
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
): res is HttpClientSuccessResponse =>
  res.type === "success" &&
  isRedirect(res.status) &&
  !!res.headers.location &&
  res.headers.location.trim().length > 0;

const getLollipopParamsFromUrlString = (url: string) => {
  try {
    const lollipopParams = new Map<string, string>();
    const constructedUrl = new PolyfillURL(url);
    // Extract Query Params
    const params: PolyfillURLSearchParams = constructedUrl.searchParams;
    params.forEach((value, name) => lollipopParams.set(name, value));
    return lollipopParams;
  } catch (error) {
    return undefined;
  }
};

const isRedirect = (statusCode: number) =>
  statusCode >= 300 && statusCode < 400;

type RelyingPartyOutput = {
  relyingPartyUrl: string;
  response: HttpClientResponse;
};

function* postToRelyingPartyWithImplicitCodeFlow(
  rpTextHtmlResponse: HttpClientSuccessResponse
): Generator<ReduxSagaEffect, RelyingPartyOutput | undefined, any> {
  const formPostDataEither = yield* call(
    extractFormPostDataFromHTML,
    rpTextHtmlResponse.body
  );
  if (E.isLeft(formPostDataEither)) {
    const errorMessage = formPostDataEither.left;
    logToMixPanel(
      `Form extraction from HTML page failed, implicit code flow: ${errorMessage}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "Could not process redirection page, Implicit code flow"
      )
    );
    return undefined;
  }

  const formData = formPostDataEither.right.params;
  const relyingPartyRedirectUrl = formPostDataEither.right.url;
  const state = formPostDataEither.right.state;

  const lollipopSignatureEither = yield* call(
    generateLollipopSignature,
    state,
    formData,
    relyingPartyRedirectUrl
  );
  if (E.isLeft(lollipopSignatureEither)) {
    const errorMessage = lollipopSignatureEither.left;
    logToMixPanel(
      `Could not sign request with LolliPoP, Implicit code flow: ${errorMessage}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "could not sign request with LolliPoP, Implicit code flow"
      )
    );
    return undefined;
  }

  const lollipopSignature = lollipopSignatureEither.right;

  const inAppBrowserUrlResponse = yield* call(nativeRequest, {
    verb: "post",
    body: Object.fromEntries(formData.entries()),
    url: relyingPartyRedirectUrl,
    headers: lollipopSignature.headers as Record<string, string>,
    followRedirects: false
  });

  if (isCancelledFailure(inAppBrowserUrlResponse)) {
    return undefined;
  }

  const output: RelyingPartyOutput = {
    relyingPartyUrl: relyingPartyRedirectUrl,
    response: inAppBrowserUrlResponse
  };
  return output;
}

function* redirectToRelyingPartyWithAuthorizationCodeFlow(
  rpRedirectResponse: HttpClientSuccessResponse
): Generator<ReduxSagaEffect, RelyingPartyOutput | undefined, any> {
  const relyingPartyRedirectUrl = rpRedirectResponse.headers.location;
  if (!relyingPartyRedirectUrl || relyingPartyRedirectUrl.trim().length === 0) {
    logToMixPanel(
      `could not find valid Location header for Relying Party redirect url, authorization code flow: ${!!relyingPartyRedirectUrl}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "Could not find valid Location header, Authorization code flow"
      )
    );
    return undefined;
  }

  const lollipopParamsMap = getLollipopParamsFromUrlString(
    relyingPartyRedirectUrl
  );
  const state = lollipopParamsMap?.get("state");
  if (!lollipopParamsMap || !state) {
    logToMixPanel(
      `could not extract lollipop params or state from RelyingParty URL, params: ${!!lollipopParamsMap}, state: ${!!state}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "could not extract data from RelyingParty URL"
      )
    );
    return undefined;
  }

  const lollipopSignatureEither = yield* call(
    generateLollipopSignature,
    state,
    lollipopParamsMap,
    relyingPartyRedirectUrl
  );
  if (E.isLeft(lollipopSignatureEither)) {
    const errorMessage = lollipopSignatureEither.left;
    logToMixPanel(
      `Could not sign request with LolliPoP, Authorization code flow: ${errorMessage}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        "could not sign request with LolliPoP, Authorization code flow"
      )
    );
    return undefined;
  }

  const lollipopSignature = lollipopSignatureEither.right;

  const inAppBrowserUrlResponse = yield* call(nativeRequest, {
    verb: "get",
    url: relyingPartyRedirectUrl,
    headers: lollipopSignature.headers as Record<string, string>,
    followRedirects: false
  });

  if (isCancelledFailure(inAppBrowserUrlResponse)) {
    return undefined;
  }

  return {
    relyingPartyUrl: relyingPartyRedirectUrl,
    response: inAppBrowserUrlResponse
  };
}

function* generateLollipopSignature(
  state: string,
  lollipopParamsMap: Map<string, string>,
  relyingPartyRedirectUrl: string
): Generator<ReduxSagaEffect, E.Either<string, RequestInit>, any> {
  const lollipopConfig: LollipopConfig = {
    nonce: state,
    customContentToSign: Object.fromEntries(lollipopParamsMap.entries())
  };

  const requestInit = { headers: {}, method: "GET" };

  const keyTag = yield* select(lollipopKeyTagSelector);
  const publicKey = yield* select(lollipopPublicKeySelector);
  const keyInfo = yield* call(generateKeyInfo, keyTag, publicKey);
  try {
    const lollipopSignature = yield* call(
      lollipopRequestInit,
      lollipopConfig,
      keyInfo,
      relyingPartyRedirectUrl,
      requestInit
    );
    return E.right(lollipopSignature);
  } catch (e) {
    return E.left(`${e}`);
  }
}

type PostData = {
  url: string;
  params: Map<string, string>;
  state: string;
};

const extractFormPostDataFromHTML = (
  html: string
): E.Either<string, PostData> => {
  const formData = new Map<string, string>();
  try {
    const parser = new HTMLParser2({
      onopentag(name, attributes) {
        processHtmlFormTag(name, attributes, formData);
      }
    });
    parser.write(html);
    parser.end();
  } catch (e) {
    return E.left(`${e}`);
  }

  return validateAndProcessExtractedFormData(formData);
};

const processHtmlFormTag = (
  name: string,
  attributes: Record<string, string>,
  formData: Map<string, string>
) => {
  const tagForm = "form";
  const tagInput = "input";
  if (tagForm === name.toLowerCase()) {
    const method = attributes.method;
    if (method) {
      formData.set("method", method.trim().toLowerCase());
    }
    const action = attributes.action;
    if (action) {
      formData.set("action", action.trim());
    }
  } else if (tagInput === name.toLowerCase()) {
    const name = attributes.name;
    const value = attributes.value;
    if (name && value) {
      formData.set(name.trim(), value.trim());
    }
  }
};

const validateAndProcessExtractedFormData = (
  formData: Map<string, string>
): E.Either<string, PostData> => {
  const method = formData.get("method");
  if (method !== "post") {
    return E.left(`Invalid form 'method' found: ${method}`);
  }

  const relyingPartyRedirectUrl = formData.get("action");
  if (!relyingPartyRedirectUrl) {
    return E.left(`Missing form 'action' value`);
  }
  try {
    new URL(relyingPartyRedirectUrl);
  } catch {
    return E.left(`Invalid form 'action' value`);
  }

  const state = formData.get("state");
  if (!state || state.trim().length === 0) {
    return E.left(`Missing or invalid 'state' attribute: ${!!state}`);
  }

  formData.delete("method");
  formData.delete("action");

  return E.right({
    params: formData,
    state,
    url: relyingPartyRedirectUrl
  });
};
