import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
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
  try {
    const getConsentsResult = yield* call(mockHttpNativeCall, {
      verb: "get",
      followRedirects: true,
      url: fimsCTAUrl
    });

    yield* put(fimsGetConsentsListAction.success(getConsentsResult));
  } catch {
    // TODO:: failure backend response should report a fimsGetConsentsListAction.failure
    return;
  }
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
  const oidcProviderDomainLowercase = oidcProviderDomain?.toLowerCase();

  const providerAcceptRedirectRes = yield* call(mockHttpNativeCall, {
    followRedirects: false,
    verb: "post",
    url: action.payload.acceptUrl
  });

  const rpUrl = yield* call(
    recurseUntilRPUrl,
    providerAcceptRedirectRes.headers.Location,
    oidcProviderDomainLowercase
  );

  // --------------- lolliPoP -----------------

  const lollipopUrl = rpUrl.headers.Location;
  const urlQueryParams = getQueryParamsFromUrlString(lollipopUrl); // new URLSearchParams(rpUrl.headers.Location);

  const auth_code = urlQueryParams.authorization_code;
  const lollipopNonce = urlQueryParams.nonce;

  if (!auth_code || !lollipopNonce) {
    // TODO:: proper error handling
    return;
  }

  const lollipopConfig: LollipopConfig = {
    nonce: lollipopNonce,
    customContentToSign: {
      authorization_code: auth_code
    }
  };

  const requestInit = { headers: {}, method: "GET" as const };

  const keyTag = yield* select(lollipopKeyTagSelector);
  const publicKey = yield* select(lollipopPublicKeySelector);
  const keyInfo = yield* call(generateKeyInfo, keyTag, publicKey);
  const lollipopInit = yield* call(
    lollipopRequestInit,
    lollipopConfig,
    keyInfo,
    lollipopUrl,
    requestInit
  );

  if (!lollipopInit.headers) {
    // TODO:: proper error handling
    return;
  }

  const inAppBrowserUrl = yield* call(mockHttpNativeCall, {
    verb: "get",
    url: lollipopUrl,
    headers: lollipopInit.headers as Record<string, string>,
    followRedirects: false
  });

  // ----------------- end lolliPoP -----------------
  const navigateToMsgHome = () =>
    NavigationService.navigate("MAIN", {
      screen: "MESSAGES_HOME"
    });
  yield* put(fimsGetRedirectUrlAndOpenIABAction.success());
  yield* call(navigateToMsgHome);
  return openAuthenticationSession(inAppBrowserUrl.headers.Location, "");
}

// -------------------- UTILS --------------------

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

const recurseUntilRPUrl = async (url: string, lowerCaseOidcDomain: string) => {
  const res = await mockHttpNativeCall({
    followRedirects: false,
    verb: "get",
    url
  });
  const isOIDCProviderBaseUrl =
    res.headers.Location.toLowerCase().startsWith(lowerCaseOidcDomain);

  if (!isRedirect(res.status) || !isOIDCProviderBaseUrl) {
    return res;
  } else {
    return await recurseUntilRPUrl(res.headers.Location, lowerCaseOidcDomain);
  }
};
