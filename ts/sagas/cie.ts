import * as pot from "italia-ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "redux-saga/effects";
import {
  cieIsSupported,
  nfcIsEnabled,
  startWatchingNfcEnablement
} from "../store/actions/cie";
import {
  isCieSupportedSelector,
  isNfcEnabledSelector
} from "../store/reducers/cie";
import { isCIEAuthenticationSupported, isNfcEnabled } from "../utils/cie";

export function* checkCieAvailabilitySaga(): SagaIterator {
  try {
    yield put(cieIsSupported.request());
    const response: boolean = yield call(isCIEAuthenticationSupported);
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

export function* checkNfcEnablementSaga(): SagaIterator {
  yield take(startWatchingNfcEnablement);
  while (true) {
    try {
      // yield put(nfcIsEnabled.request())
      const response: boolean = yield call(isNfcEnabled);
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
