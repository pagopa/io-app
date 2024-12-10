import {
  HttpCallConfig,
  HttpClientFailureResponse,
  HttpClientResponse,
  HttpClientSuccessResponse,
  isCancelledFailure,
  nativeRequest
} from "@pagopa/io-react-native-http-client";
import {
  isLoginUtilsError,
  openAuthenticationSession
} from "@pagopa/io-react-native-login-utils";
import * as E from "fp-ts/lib/Either";
import { Parser as HTMLParser2 } from "htmlparser2";
import {
  URL as PolyfillURL,
  URLSearchParams as PolyfillURLSearchParams
} from "react-native-url-polyfill";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { IOToast } from "@pagopa/io-app-design-system";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { ReduxSagaEffect } from "../../../../types/utils";
import { LollipopConfig } from "../../../lollipop";
import { generateKeyInfo } from "../../../lollipop/saga";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../../lollipop/store/reducers/lollipop";
import { lollipopRequestInit } from "../../../lollipop/utils/fetch";
import { fimsGetRedirectUrlAndOpenIABAction } from "../store/actions";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
import { fimsCtaTextSelector } from "../store/selectors";
import { trackInAppBrowserOpening } from "../../common/analytics";
import I18n from "../../../../i18n";
import {
  deallocateFimsAndRenewFastLoginSession,
  deallocateFimsResourcesAndNavigateBack
} from "./handleFimsResourcesDeallocation";
import {
  buildAbsoluteUrl,
  computeAndTrackAuthenticationError,
  formatHttpClientResponseForMixPanel,
  isFastLoginFailure,
  isRedirect,
  isValidRedirectResponse
} from "./sagaUtils";

// note: IAB => InAppBrowser

export function* handleFimsGetRedirectUrlAndOpenIAB(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenIABAction)["request"]>
) {
  const oidcProviderDomain = yield* select(fimsDomainSelector);
  if (!oidcProviderDomain) {
    const debugMessage = `missing FIMS, domain is ${oidcProviderDomain}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return;
  }
  const maybeAcceptUrl = action.payload.acceptUrl;

  const acceptUrl = buildAbsoluteUrl(maybeAcceptUrl ?? "", oidcProviderDomain);
  if (!acceptUrl) {
    const debugMessage = `unable to accept grants, could not buld url. obtained URL: ${maybeAcceptUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
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
    if (isFastLoginFailure(rpRedirectResponse)) {
      yield* call(deallocateFimsAndRenewFastLoginSession);
      return;
    }
    const debugMessage = `could not get RelyingParty redirect URL, ${formatHttpClientResponseForMixPanel(
      rpRedirectResponse
    )}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
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
    const debugMessage = `IAB url call failed or without a valid redirect, code: ${
      inAppBrowserUrlResponse.type === "failure"
        ? // eslint-disable-next-line sonarjs/no-nested-template-literals
          `${inAppBrowserUrlResponse.code}, message: ${inAppBrowserUrlResponse.message}`
        : inAppBrowserUrlResponse.status
    }`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return;
  }

  // ----------------- end lolliPoP -----------------

  yield* put(fimsGetRedirectUrlAndOpenIABAction.success());
  yield* call(deallocateFimsResourcesAndNavigateBack);
  yield* call(computeAndTrackInAppBrowserOpening, action);

  try {
    yield* call(
      openAuthenticationSession,
      inAppBrowserRedirectUrl,
      "iossoapi",
      true
    );
  } catch (error: unknown) {
    yield* call(handleInAppBrowserErrorIfNeeded, error);
  }
}

const recurseUntilRPUrl = async (
  httpClientConfig: HttpCallConfig,
  fimsDomain: string
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

  const isFIMSProviderBaseUrl = redirectUrl
    .toLowerCase()
    .startsWith(fimsDomain.toLowerCase());

  if (!isFIMSProviderBaseUrl) {
    return res;
  } else {
    return await recurseUntilRPUrl(
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

const extractValidRedirect = (
  data: HttpClientResponse,
  originalRequestUrl: string
) =>
  isValidRedirectResponse(data)
    ? buildAbsoluteUrl(data.headers.location, originalRequestUrl)
    : undefined;

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
    const debugMessage = `Form extraction from HTML page failed, implicit code flow: ${errorMessage}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
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
    const debugMessage = `Could not sign request with LolliPoP, Implicit code flow: ${errorMessage}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
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
    const debugMessage = `could not find valid Location header for Relying Party redirect url, authorization code flow: ${!!relyingPartyRedirectUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return undefined;
  }

  const lollipopParamsMap = getLollipopParamsFromUrlString(
    relyingPartyRedirectUrl
  );
  const state = lollipopParamsMap?.get("state");
  if (!lollipopParamsMap || !state) {
    const debugMessage = `could not extract lollipop params or state from RelyingParty URL, params: ${!!lollipopParamsMap}, state: ${!!state}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
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
    const debugMessage = `Could not sign request with LolliPoP, Authorization code flow: ${errorMessage}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
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
    const attributeName = attributes.name;
    const value = attributes.value;
    if (attributeName && value) {
      formData.set(attributeName.trim(), value.trim());
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
    /* eslint-disable no-new */
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

function* computeAndTrackInAppBrowserOpening(
  action: ActionType<typeof fimsGetRedirectUrlAndOpenIABAction.request>
) {
  const serviceId = action.payload.serviceId;
  const service = yield* select(serviceByIdSelector, serviceId);
  const ctaText = yield* select(fimsCtaTextSelector);
  yield* call(
    trackInAppBrowserOpening,
    serviceId,
    service?.service_name,
    service?.organization_name,
    service?.organization_fiscal_code,
    ctaText
  );
}

function* handleInAppBrowserErrorIfNeeded(error: unknown) {
  if (!isInAppBrowserClosedError(error)) {
    const debugMessage = `IAB opening failed: ${inAppBrowserErrorToHumanReadable(
      error
    )}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* call(IOToast.error, I18n.t("FIMS.consentsScreen.inAppBrowserError"));
  }
}

const isInAppBrowserClosedError = (error: unknown) =>
  isLoginUtilsError(error) &&
  error.userInfo.error === "NativeAuthSessionClosed";

const inAppBrowserErrorToHumanReadable = (error: unknown) => {
  if (isLoginUtilsError(error)) {
    return `${error.code} ${error.userInfo.error}`;
  }
  return JSON.stringify(error);
};
