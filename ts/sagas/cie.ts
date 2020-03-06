import cieManager from "@pagopa/react-native-cie";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { RTron } from "../boot/configureStoreAndPersistor";
import { cieIsSupported, nfcIsEnabled } from "../store/actions/cie";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

export function* watchCieAuthenticationSaga(): SagaIterator {
  // Trigger a saga on nfcIsEnabled to check if NFC is enabled or not
  yield takeLatest(nfcIsEnabled.request, checkNfcEnablementSaga);
  // check if the device is compliant with CIE authentication
  yield call(checkCieAvailabilitySaga, cieManager.isCIEAuthenticationSupported);
}

/**
 * check if the device is compatible with CIE authentication
 * see https://github.com/pagopa/io-cie-android-sdk/blob/29cc1165bbd3d90d61239369f22ec78b2e4c8f6c/index.js#L125
 */
export function* checkCieAvailabilitySaga(
  isCIEAuthenticationSupported: typeof cieManager["isCIEAuthenticationSupported"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<
      typeof isCIEAuthenticationSupported
    > = yield call(isCIEAuthenticationSupported);
    yield put(cieIsSupported.success(response));
  } catch (e) {
    yield put(cieIsSupported.failure(new Error(e)));
  }
}
const CIE_NFC_STATUS_INTERVAL = 1500 as Millisecond;
/**
 * checks if the nfc is enabled. If it is NOT enbled it checks again with a delay
 */
export function* checkNfcEnablementSaga(): SagaIterator {
  try {
    while (true) {
      RTron.log("checkNfcEnablementSaga");
      const isNfcEnabled: SagaCallReturnType<
        typeof cieManager.isNFCEnabled
      > = yield call(cieManager.isNFCEnabled);
      yield put(nfcIsEnabled.success(isNfcEnabled));
      if (isNfcEnabled) {
        return;
      }
      // wait and check again
      yield call(startTimer, CIE_NFC_STATUS_INTERVAL);
    }
  } catch (e) {
    yield put(nfcIsEnabled.failure(new Error(e))); // TODO: check e type
  }
}
