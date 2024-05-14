import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga";
import { fimsTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import {
  mockHttpNativeCall,
  mockSetNativeCookie
} from "../__mocks__/mockFIMSCallbacks";
import { fimsGetConsentsListAction } from "../store/actions";
import { fimsCTAUrlSelector } from "../store/selectors";

export function* watchFimsSaga(): SagaIterator {
  yield* takeLatest(
    fimsGetConsentsListAction.request,
    handleFimsGetConsentsList
  );
}

function* handleFimsGetConsentsList() {
  // TODO:: maybe move navigation here from utils

  const fimsToken = yield* select(fimsTokenSelector);
  const oidcProviderUrl = yield* select(fimsDomainSelector);
  const fimsCTAUrl = yield* select(fimsCTAUrlSelector);

  if (
    fimsToken === undefined ||
    oidcProviderUrl === undefined ||
    fimsCTAUrl === undefined
  ) {
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

  yield* put(fimsGetConsentsListAction.success(getConsentsResult));
}
