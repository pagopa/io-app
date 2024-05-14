import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga";
import { ActionType } from "typesafe-actions";
import { fimsTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import {
  mockHttpNativeCall,
  mockSetNativeCookie
} from "../__mocks__/mockFIMSCallbacks";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../store/actions";
import { fimsCTAUrlSelector } from "../store/selectors";

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
  const oIDCProviderUrl = yield* select(fimsDomainSelector);
  const fimsCTAUrl = yield* select(fimsCTAUrlSelector);

  if (
    fimsToken === undefined ||
    oIDCProviderUrl === undefined ||
    fimsCTAUrl === undefined
  ) {
    // TODO:: proper error handling
    yield* put(fimsGetConsentsListAction.failure(new Error("missing data")));
    return;
  }

  yield* call(
    mockSetNativeCookie,
    oIDCProviderUrl,
    "X-IO-Federation-Token",
    fimsToken
  );

  const getConsentsResult = yield* call(mockHttpNativeCall, {
    verb: "get",
    followRedirects: true,
    url: fimsCTAUrl
  });

  yield* put(fimsGetConsentsListAction.success(getConsentsResult));
}

// note: IAB => InAppBrowser
function* handleFimsGetRedirectUrlAndOpenIAB(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenIABAction)["request"]>
) {
  // TODO:: get auth code and nonce, then sign with lollipop, HTTP GET and open IAB
  const rpUrl = yield* call(recurseUntilRPUrl, action.payload.acceptUrl);

  yield rpUrl;
}

const isRedirect = (statusCode: number) => statusCode === 302;
const isOIDCProviderBaseUrl = (url: string) => url.includes("oidc-provider");
const recurseUntilRPUrl = async (url: string) => {
  const res = await mockHttpNativeCall({
    followRedirects: false,
    verb: "get",
    url
  });

  if (!isRedirect(res.status) || !isOIDCProviderBaseUrl(res.headers.Location)) {
    return res;
  } else {
    return; // TODO recursion
  }
};
