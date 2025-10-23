import {
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
import I18n from "i18next";
import { ReduxSagaEffect } from "../../../../types/utils";
import { LollipopConfig } from "../../../lollipop";
import { generateKeyInfo } from "../../../lollipop/saga";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../../lollipop/store/reducers/lollipop";
import { lollipopRequestInit } from "../../../lollipop/utils/fetch";
import { serviceDetailsByIdSelector } from "../../../services/details/store/selectors";
import {
  fimsCtaTextSelector,
  fimsEphemeralSessionOniOSSelector,
  relyingPartyServiceIdSelector
} from "../store/selectors";
import { trackInAppBrowserOpening } from "../../common/analytics";
import { fimsSignAndRetrieveInAppBrowserUrlAction } from "../store/actions";
import {
  computeAndTrackAuthenticationError,
  absoluteRedirectUrlFromHttpClientResponse,
  isRedirectStatusCode,
  handleFimsResourcesDeallocation,
  handleFimsBackNavigation
} from "./sagaUtils";

// note: IAB => InAppBrowser

export function* handleFimsAuthorizationOrImplicitCodeFlow(
  action: ActionType<
    (typeof fimsSignAndRetrieveInAppBrowserUrlAction)["request"]
  >
) {
  const responseTowardsRelyingParty = action.payload;
  // Redirect status code is an Authorization code flow, where the location header
  // (in the response) contains the url towards the relying party and the parameters
  // to sign with lollipop are expressed as query strings (in the URL).
  // 200 status code with text/html content-type is and Implicit Code flow where the
  // response's body contains an HTML page with an hidden form in autosubmit mode
  // (lollipop parameters are extracted from the form data).
  // Both code flows below adds signed lollipop parameters.
  const inAppBrowserUrlResponseWrapper = isRedirectStatusCode(
    responseTowardsRelyingParty.status
  )
    ? yield* call(
        redirectToRelyingPartyWithAuthorizationCodeFlow,
        responseTowardsRelyingParty
      )
    : yield* call(
        postToRelyingPartyWithImplicitCodeFlow,
        responseTowardsRelyingParty
      );
  if (!inAppBrowserUrlResponseWrapper) {
    // Error and cancellation have already been handled
    return;
  }

  const relyingPartyRedirectUrl =
    inAppBrowserUrlResponseWrapper.relyingPartyUrl;
  const inAppBrowserUrlResponse = inAppBrowserUrlResponseWrapper.response;
  const inAppBrowserRedirectUrl = absoluteRedirectUrlFromHttpClientResponse(
    inAppBrowserUrlResponse,
    relyingPartyRedirectUrl
  );

  if (!inAppBrowserRedirectUrl) {
    const debugMessage = `InApp Browser url call failed or without a valid redirect, code: ${
      inAppBrowserUrlResponse.type === "failure"
        ? // eslint-disable-next-line sonarjs/no-nested-template-literals
          `${inAppBrowserUrlResponse.code}, message: ${inAppBrowserUrlResponse.message}`
        : inAppBrowserUrlResponse.status
    }`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsSignAndRetrieveInAppBrowserUrlAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return;
  }

  yield* put(fimsSignAndRetrieveInAppBrowserUrlAction.success());
  yield* call(handleFimsResourcesDeallocation);
  yield* call(computeAndTrackInAppBrowserOpening);

  const ephemeralSessionOniOS = yield* select(
    fimsEphemeralSessionOniOSSelector
  );
  try {
    yield* call(
      openAuthenticationSession,
      inAppBrowserRedirectUrl,
      "iossoapi",
      !ephemeralSessionOniOS
    );
  } catch (error: unknown) {
    yield* call(handleInAppBrowserErrorIfNeeded, error);
  } finally {
    yield* call(handleFimsBackNavigation);
  }
}

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

export type RelyingPartyOutput = {
  relyingPartyUrl: string;
  response: HttpClientResponse;
};

export function* postToRelyingPartyWithImplicitCodeFlow(
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
      fimsSignAndRetrieveInAppBrowserUrlAction.failure({
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
      fimsSignAndRetrieveInAppBrowserUrlAction.failure({
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

export function* redirectToRelyingPartyWithAuthorizationCodeFlow(
  rpRedirectResponse: HttpClientSuccessResponse
): Generator<ReduxSagaEffect, RelyingPartyOutput | undefined, any> {
  const relyingPartyRedirectUrl = rpRedirectResponse.headers.location;
  if (!relyingPartyRedirectUrl || relyingPartyRedirectUrl.trim().length === 0) {
    const debugMessage = `could not find valid Location header for Relying Party redirect url, authorization code flow: ${!!relyingPartyRedirectUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsSignAndRetrieveInAppBrowserUrlAction.failure({
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
      fimsSignAndRetrieveInAppBrowserUrlAction.failure({
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
      fimsSignAndRetrieveInAppBrowserUrlAction.failure({
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

export function* computeAndTrackInAppBrowserOpening() {
  const serviceId = yield* select(relyingPartyServiceIdSelector);
  const service = serviceId
    ? yield* select(serviceDetailsByIdSelector, serviceId)
    : undefined;
  const ctaText = yield* select(fimsCtaTextSelector);
  yield* call(
    trackInAppBrowserOpening,
    serviceId,
    service?.name,
    service?.organization.name,
    service?.organization.fiscal_code,
    ctaText
  );
}

export function* handleInAppBrowserErrorIfNeeded(error: unknown) {
  if (!isInAppBrowserClosedError(error)) {
    const debugMessage = `InApp Browser opening failed: ${inAppBrowserErrorToHumanReadable(
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
