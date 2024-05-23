import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { StackActions } from "@react-navigation/native";
import * as E from "fp-ts/Either";
import { URL } from "react-native-url-polyfill";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga";
import { ActionType } from "typesafe-actions";
import NavigationService from "../../../navigation/NavigationService";
import { fimsTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import { LollipopConfig } from "../../lollipop";
import { generateKeyInfo } from "../../lollipop/saga";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../lollipop/store/reducers/lollipop";
import { lollipopRequestInit } from "../../lollipop/utils/fetch";
import {
  HttpClientResponse,
  HttpClientSuccessResponse,
  mockHttpNativeCall,
  mockSetNativeCookie
} from "../__mocks__/mockFIMSCallbacks";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../store/actions";
import { fimsCTAUrlSelector } from "../store/reducers";

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
  // TODO:: maybe move navigation here from utils

  const fimsToken = yield* select(fimsTokenSelector);
  const oidcProviderUrl = yield* select(fimsDomainSelector);
  const fimsCTAUrl = yield* select(fimsCTAUrlSelector);

  if (!fimsToken || !oidcProviderUrl || !fimsCTAUrl) {
    // TODO:: proper error handling
    yield* put(
      fimsGetConsentsListAction.failure(new Error("missing FIMS data"))
    );
    return;
  }

  yield* call(
    mockSetNativeCookie,
    oidcProviderUrl,
    "_io_fims_token",
    fimsToken
  );
  const getConsentsResult = yield* call(mockHttpNativeCall, {
    verb: "get",
    followRedirects: true,
    url: fimsCTAUrl
  });

  if (getConsentsResult.type === "failure") {
    yield* put(
      fimsGetConsentsListAction.failure(new Error(" consent data fetch error"))
    );
    return;
  }
  yield* put(fimsGetConsentsListAction.success(getConsentsResult));
}

// note: IAB => InAppBrowser
function* handleFimsGetRedirectUrlAndOpenIAB(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenIABAction)["request"]>
) {
  const oidcProviderDomain = yield* select(fimsDomainSelector);
  if (!oidcProviderDomain) {
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        new Error("missing FIMS domain")
      )
    );
    return;
  }

  const providerAcceptRedirectRes = yield* call(mockHttpNativeCall, {
    followRedirects: false,
    verb: "post",
    url: action.payload.acceptUrl
  });

  const acceptRedirectUrl = extractValidRedirect(
    providerAcceptRedirectRes,
    action.payload.acceptUrl
  );

  if (!acceptRedirectUrl) {
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        new Error("could not get grant acceptance response")
      )
    );
    return;
  }

  const rpUrl = yield* call(
    recurseUntilRPUrl,
    acceptRedirectUrl,
    oidcProviderDomain
  );

  // --------------- lolliPoP -----------------
  const relyingPartyRedirectUrl = extractValidRedirect(
    rpUrl,
    oidcProviderDomain
  );

  if (!relyingPartyRedirectUrl) {
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        new Error("could not get RelyingParty redirect URL")
      )
    );
    return;
  }

  const [authCode, lollipopNonce] = getQueryParamsFromUrlString(
    relyingPartyRedirectUrl
  );

  if (!authCode || !lollipopNonce) {
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
    yield* put(
      fimsGetRedirectUrlAndOpenIABAction.failure(
        new Error("could not sign request with LolliPoP")
      )
    );
    return;
  }
  const lollipopInit = lollipopEither.right;

  const inAppBrowserUrl = yield* call(mockHttpNativeCall, {
    verb: "get",
    url: relyingPartyRedirectUrl,
    headers: lollipopInit.headers as Record<string, string>,
    followRedirects: false
  });

  const inAppBrowserRedirectUrl = extractValidRedirect(
    inAppBrowserUrl,
    relyingPartyRedirectUrl
  );

  if (!inAppBrowserRedirectUrl) {
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

const hasValidRedirect = (
  res: HttpClientResponse
): res is SuccessResponseWithLocationHeader =>
  res.type === "success" &&
  res.headers.Location !== undefined &&
  res.headers.Location?.trim().length > 0;

const extractValidRedirect = (
  data: HttpClientResponse,
  originalRequestUrl: string
) => {
  if (!hasValidRedirect(data)) {
    return undefined;
  }
  const redirect = data.headers.Location;
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
  url: string,
  oidcDomain: string
): Promise<HttpClientResponse> => {
  const res = await mockHttpNativeCall({
    followRedirects: false,
    verb: "get",
    url
  });

  const redirectUrl = extractValidRedirect(res, url);

  if (!hasValidRedirect(res) || !redirectUrl) {
    return res;
  }

  const isOIDCProviderBaseUrl = redirectUrl.startsWith(
    oidcDomain.toLowerCase()
  );

  if (!isRedirect(res.status) || !isOIDCProviderBaseUrl) {
    return res;
  } else {
    return await recurseUntilRPUrl(res.headers.Location, oidcDomain);
  }
};
