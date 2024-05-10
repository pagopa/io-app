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
    console.log(
      "failure",
      JSON.stringify({ fimsToken, oIDCProviderUrl, fimsCTAUrl })
    );
    yield* put(fimsGetConsentsListAction.failure(new Error()));
    return;
  }

  console.log(
    "data is :",

    JSON.stringify({ fimsToken, oIDCProviderUrl, fimsCTAUrl })
  );

  mockSetNativeCookie(oIDCProviderUrl, "X-IO-Federation-Token", fimsToken);

  const getConsentsResult = yield* call(mockHttpNativeCall, {
    verb: "get",
    followRedirects: true,
    url: fimsCTAUrl
  });
  console.log("result-getConsents: ", getConsentsResult);

  yield* put(fimsGetConsentsListAction.success(getConsentsResult));
}
function* handleFimsGetRedirectUrlAndOpenBrowser(
  action: ActionType<(typeof fimsGetRedirectUrlAndOpenBrowserAction)["request"]>
) {
  console.log(action.payload);
  yield null;
}
