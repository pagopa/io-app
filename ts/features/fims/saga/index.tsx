import {
  HttpCallConfig,
  HttpClientFailureResponse,
  HttpClientResponse,
  HttpClientSuccessResponse,
  nativeRequest,
  setCookie
} from "@pagopa/io-react-native-http-client";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { StackActions } from "@react-navigation/native";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { URL } from "react-native-url-polyfill";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga";
import { ActionType } from "typesafe-actions";
import { mixpanelTrack } from "../../../mixpanel";
import NavigationService from "../../../navigation/NavigationService";
import { fimsTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import { buildEventProperties } from "../../../utils/analytics";
import { LollipopConfig } from "../../lollipop";
import { generateKeyInfo } from "../../lollipop/saga";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../lollipop/store/reducers/lollipop";
import { lollipopRequestInit } from "../../lollipop/utils/fetch";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../store/actions";
import { fimsCTAUrlSelector } from "../store/reducers";
import { ConsentData } from "../types";

export function* watchFimsSaga(): SagaIterator {
  yield* takeLatest(
    fimsGetConsentsListAction.request,
    handleFimsGetConsentsList
  );
  yield* takeLatest(
    fimsGetRedirectUrlAndOpenIABAction.request,
    handleFimsGetRedirectUrlAndOpenIAB
  );
}

function* handleFimsGetConsentsList() {
  const fimsToken = yield* select(fimsTokenSelector);
  const oidcProviderUrl = yield* select(fimsDomainSelector);
  const fimsCTAUrl = yield* select(fimsCTAUrlSelector);

  if (!fimsToken || !oidcProviderUrl || !fimsCTAUrl) {
    // TODO:: proper error handling
    logToMixPanel(
      `missing FIMS data: fimsToken: ${!!fimsToken}, oidcProviderUrl: ${!!oidcProviderUrl}, fimsCTAUrl: ${!!fimsCTAUrl}`
    );

    yield* put(
      fimsGetConsentsListAction.failure(new Error("missing FIMS data"))
    );
    return;
  }

  yield* call(setCookie, oidcProviderUrl, "/", "_io_fims_token", fimsToken);

  // TODO:: use with future BE lang implementation -- const lang = getLocalePrimaryWithFallback();

  const getConsentsResult = yield* call(nativeRequest, {
    verb: "get",
    followRedirects: true,
    url: fimsCTAUrl,
    headers: {
      "Accept-Language": "it-IT"
    }
  });

  if (getConsentsResult.type === "failure") {
    logToMixPanel(
      `consent data fetch error: ${JSON.stringify(getConsentsResult)}`
    );
    yield* put(
      fimsGetConsentsListAction.failure(new Error("consent data fetch error"))
    );
    return;
  }

  yield pipe(
    getConsentsResult.body,
    item => {
      try {
        return JSON.parse(item);
      } catch {
        return undefined;
      }
    },
    ConsentData.decode,
    E.foldW(
      () => {
        logToMixPanel(`could not decode: ${getConsentsResult.body}`);
        return put(
          fimsGetConsentsListAction.failure(new Error("could not decode"))
        );
      },
      decodedConsents => put(fimsGetConsentsListAction.success(decodedConsents))
    )
  );
}

// note: IAB => InAppBrowser
function* handleFimsGetRedirectUrlAndOpenIAB(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenIABAction)["request"]>
) {
  const oidcProviderDomain = yield* select(fimsDomainSelector);
  if (!oidcProviderDomain) {
    logToMixPanel(`missing FIMS, domain is ${oidcProviderDomain}`);
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        new Error("missing FIMS domain")
      )
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
        new Error("unable to accept grants: invalid URL")
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
    logToMixPanel(
      `could not get RelyingParty redirect URL, ${JSON.stringify(
        rpRedirectResponse
      )}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        new Error("could not get RelyingParty redirect URL")
      )
    );
    return;
  }
  const relyingPartyRedirectUrl = rpRedirectResponse.headers.Location;

  const [authCode, lollipopNonce] = getQueryParamsFromUrlString(
    relyingPartyRedirectUrl
  );

  if (!authCode || !lollipopNonce) {
    logToMixPanel(
      `could not extract auth data from RelyingParty URL, auth code: ${!!authCode}, nonce: ${!!lollipopNonce}`
    );
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        new Error("could not extract auth data from RelyingParty URL")
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
        new Error("could not sign request with LolliPoP")
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
        new Error("IAB url call failed or without a valid redirect")
      )
    );
    return;
  }

  // ----------------- end lolliPoP -----------------

  yield* put(fimsGetRedirectUrlAndOpenIABAction.success());
  yield* call(NavigationService.dispatchNavigationAction, StackActions.pop());
  return openAuthenticationSession(inAppBrowserRedirectUrl, "");
}

// -------------------- UTILS --------------------

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

interface SuccessResponseWithLocationHeader extends HttpClientSuccessResponse {
  headers: {
    Location: string;
  };
}

const isValidRedirectResponse = (
  res: HttpClientResponse
): res is SuccessResponseWithLocationHeader =>
  res.type === "success" &&
  isRedirect(res.status) &&
  !!res.headers.Location &&
  res.headers.Location.trim().length > 0;

const buildAbsoluteUrl = (redirect: string, originalRequestUrl: string) => {
  try {
    const redirectUrl = new URL(redirect);
    return redirectUrl.href;
  } catch (error) {
    try {
      const originalUrl = new URL(originalRequestUrl);
      const origin = originalUrl.origin;
      const composedUrlString = redirect.startsWith("/")
        ? `${origin}${redirect}`
        : `${origin}/${redirect}`;
      const composedUrl = new URL(composedUrlString);
      return composedUrl.href;
    } catch {
      return undefined;
    }
  }
};

const extractValidRedirect = (
  data: HttpClientResponse,
  originalRequestUrl: string
) =>
  isValidRedirectResponse(data)
    ? buildAbsoluteUrl(data.headers.Location, originalRequestUrl)
    : undefined;

const getQueryParamsFromUrlString = (url: string) => {
  try {
    const constructedUrl = new URL(url);
    const params = constructedUrl.searchParams;
    return [params.get("authorization_code"), params.get("nonce")];
  } catch (error) {
    return [undefined, undefined];
  }
};

const isRedirect = (statusCode: number) =>
  statusCode >= 300 && statusCode < 400;

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
      message: `malformed HTTP redirect response, location header value: ${res.headers.Location}`,
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

const logToMixPanel = (toLog: string) => {
  void mixpanelTrack(
    "FIMS_TECH_TEMP_ERROR",
    buildEventProperties("TECH", undefined, { message: toLog })
  );
};
