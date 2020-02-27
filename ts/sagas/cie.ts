import cieManager from "@pagopa/react-native-cie";
import * as pot from "italia-ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { call, fork, put, select, take } from "redux-saga/effects";
import {
  cieIsSupported,
  nfcIsEnabled,
  startWatchingNfcEnablement
} from "../store/actions/cie";
import {
  isCieSupportedSelector,
  isNfcEnabledSelector
} from "../store/reducers/cie";
import { SagaCallReturnType } from "../types/utils";

export function* watchCieAuthenticationSaga(): SagaIterator {
  // Watch for checks on login by CIE on the used device and NFC sensor enablement
  yield fork(checkNfcEnablementSaga, cieManager.isNFCEnabled);
  yield call(checkCieAvailabilitySaga, cieManager.isCIEAuthenticationSupported);
}

export function* checkCieAvailabilitySaga(
  isCIEAuthenticationSupported: typeof cieManager["isCIEAuthenticationSupported"]
): SagaIterator {
  try {
    yield put(cieIsSupported.request());
    const response: SagaCallReturnType<
      typeof isCIEAuthenticationSupported
    > = yield call(isCIEAuthenticationSupported);

    const currentState: ReturnType<
      typeof isCieSupportedSelector
    > = yield select(isCieSupportedSelector);

    if (
      pot.isNone(currentState) ||
      (pot.isSome(currentState) && response !== currentState.value)
    ) {
      yield put(cieIsSupported.success(response));
      if (response === true) {
        yield put(startWatchingNfcEnablement());
      } else {
        yield put(nfcIsEnabled.success(false));
      }
    }
  } catch (e) {
    yield put(cieIsSupported.failure(new Error(e)));
  }
}

export function* checkNfcEnablementSaga(
  isNFCEnabled: typeof cieManager["isNFCEnabled"]
): SagaIterator {
  yield take(startWatchingNfcEnablement);
  while (true) {
    try {
      // yield put(nfcIsEnabled.request())
      const response: SagaCallReturnType<typeof isNFCEnabled> = yield call(
        isNFCEnabled
      );
      const currentState: ReturnType<
        typeof isNfcEnabledSelector
      > = yield select(isNfcEnabledSelector);

      if (
        pot.isNone(currentState) ||
        (pot.isSome(currentState) && response !== currentState.value)
      ) {
        yield put(nfcIsEnabled.success(response));
      }
    } catch (e) {
      yield put(nfcIsEnabled.failure(new Error(e))); // TODO: check e type
    }
  }
}
