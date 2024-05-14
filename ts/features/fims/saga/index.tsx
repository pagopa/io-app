import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga";
import { ActionType } from "typesafe-actions";
import { fimsTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import {
  mockHttpNativeCall,
  mockSetNativeCookie
} from "../../pushNotifications/sagas/mockFIMSCallbacks";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenBrowserAction
} from "../store/actions";
import { fimsCTAUrlSelector } from "../store/selectors";

export function* watchFimsSaga(): SagaIterator {
  yield* takeLatest(
    fimsGetConsentsListAction.request,
    handleFimsGetConsentsList
  );
  yield* takeLatest(
    fimsGetRedirectUrlAndOpenBrowserAction.request,
    handleFimsGetRedirectUrlAndOpenBrowser
  );
}

function* handleFimsGetConsentsList() {
  // action: ActionType<(typeof fimsGetConsentsListAction)["request"]>
  // ) {
  //   NavigationService.navigate(FIMS_ROUTES.MAIN, {
  //     screen: FIMS_ROUTES.CONSENTS
  //   }); // TODO:: maybe move navigation in saga from utils

  const fimsToken = yield* select(fimsTokenSelector);
  const oIDCProviderUrl = yield* select(fimsDomainSelector);
  const fimsCTAUrl = yield* select(fimsCTAUrlSelector);

  // in paper it looks cleaner to use FP-TS for this, but it does not play well with generator functions
  if (!fimsToken || !oIDCProviderUrl || !fimsCTAUrl) {
    yield* put(fimsGetConsentsListAction.failure(new Error()));
    return;
  }

  mockSetNativeCookie(oIDCProviderUrl, "X-IO-Federation-Token", fimsToken);

  const getConsentsResult = yield* call(mockHttpNativeCall, {
    verb: "get",
    followRedirects: true,
    url: fimsCTAUrl
  });

  yield* put(fimsGetConsentsListAction.success(getConsentsResult));
}
function* handleFimsGetRedirectUrlAndOpenBrowser(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenBrowserAction)["request"]>
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
