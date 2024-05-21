import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as E from "fp-ts/Either";
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
  HttpClientFailureResponse,
  HttpClientResponse,
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
    yield* put(fimsGetConsentsListAction.failure(new Error("missing data")));
    return;
  }

  yield* call(
    mockSetNativeCookie,
    oidcProviderUrl,
    "X-IO-Federation-Token",
    fimsToken
  );
  const getConsentsResult = yield* call(mockHttpNativeCall, {
    verb: "get",
    followRedirects: true,
    url: fimsCTAUrl
  });

  if (getConsentsResult.type === "failure") {
    return;
  }
  yield* put(fimsGetConsentsListAction.success(getConsentsResult));
  // TODO:: failure backend response should report a fimsGetConsentsListAction.failure
}

// note: IAB => InAppBrowser
function* handleFimsGetRedirectUrlAndOpenIAB(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenIABAction)["request"]>
) {
  const oidcProviderDomain = yield* select(fimsDomainSelector);
  if (!oidcProviderDomain) {
    // TODO:: proper error handling
    return;
  }

  const providerAcceptRedirectRes = yield* call(mockHttpNativeCall, {
    followRedirects: false,
    verb: "post",
    url: action.payload.acceptUrl
  });

  if (isRedirectInvalid(providerAcceptRedirectRes)) {
    // TODO:: proper error handling
    return;
  }

  const rpUrl = yield* call(
    recurseUntilRPUrl,
    providerAcceptRedirectRes.headers.Location,
    oidcProviderDomain
  );

  // --------------- lolliPoP -----------------

  if (isRedirectInvalid(rpUrl)) {
    // TODO:: proper error handling
    return;
  }

  const relyingPartyRedirectUrl = rpUrl.headers.Location;
  const urlQueryParams = getQueryParamsFromUrlString(relyingPartyRedirectUrl);

  const authCode = urlQueryParams.authorization_code;
  const lollipopNonce = urlQueryParams.nonce;

  if (!authCode || !lollipopNonce) {
    // TODO:: proper error handling
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
    // TODO:: proper error handling
    return;
  }
  const lollipopInit = lollipopEither.right;

  const inAppBrowserUrl = yield* call(mockHttpNativeCall, {
    verb: "get",
    url: relyingPartyRedirectUrl,
    headers: lollipopInit.headers as Record<string, string>,
    followRedirects: false
  });
  if (isRedirectInvalid(inAppBrowserUrl)) {
    // TODO:: proper error handling
    return;
  }

  // ----------------- end lolliPoP -----------------
  const navigateToMsgHome = () =>
    NavigationService.getNavigator().current?.goBack();
  yield* put(fimsGetRedirectUrlAndOpenIABAction.success());
  yield* call(navigateToMsgHome);
  return openAuthenticationSession(inAppBrowserUrl.headers.Location, "");
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

const isRedirectInvalid = (
  res: HttpClientResponse
): res is HttpClientFailureResponse =>
  res.type === "failure" || !res.headers.Location;

const getQueryParamsFromUrlString = (url: string) => {
  const paramArr = url.slice(url.indexOf("?") + 1).split("&");
  return Object.assign(
    {},
    ...paramArr.map(param => {
      const [key, val] = param.split("=");
      return { [key]: decodeURIComponent(val) };
    })
  );
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

  if (res.type === "failure") {
    // TODO:: proper error handling
    return res;
  }

  const isOIDCProviderBaseUrl = res.headers.Location.toLowerCase().startsWith(
    oidcDomain.toLowerCase()
  );

  if (!isRedirect(res.status) || !isOIDCProviderBaseUrl) {
    return res;
  } else {
    return await recurseUntilRPUrl(res.headers.Location, oidcDomain);
  }
};
