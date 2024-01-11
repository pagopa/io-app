import cieManager from "@pagopa/io-react-native-cie-pid";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import {
  itwCieIsSupported,
  itwHasApiLevelSupport,
  itwHasNFCFeature,
  itwNfcIsEnabled
} from "../store/actions/itwIssuancePidCieActions";
import { SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError } from "../../../utils/errors";
import { startTimer } from "../../../utils/timer";

export function* watchItwPidIssuingCieAuthSaga(): SagaIterator {
  // Trigger a saga on itwNfcIsEnabled to check if NFC is enabled or not
  yield* takeLatest(itwNfcIsEnabled.request, itwCheckNfcEnablementSaga);
  // check if the device is compliant with CIE authentication
  yield* call(
    itwCheckCieAvailabilitySaga,
    cieManager.isCIEAuthenticationSupported
  );
  // check if the device has the API Level compliant with CIE authentication
  yield* call(itwCheckHasApiLevelSupportSaga, cieManager.hasApiLevelSupport);
  // check if the device has the NFC Feature to support CIE authentication
  yield* call(itwCheckitwHasNFCFeatureSaga, cieManager.hasNFCFeature);
}

// stop cie manager to listen nfc tags
export function* itwStopCieManager(): SagaIterator {
  try {
    cieManager.removeAllListeners();
    yield* call(cieManager.stopListeningNFC);
  } catch {
    // just ignore
  }
}

/**
 * check if the device has the API Level to support CIE authentication
 * see https://github.com/pagopa/io-cie-android-sdk/blob/29cc1165bbd3d90d61239369f22ec78b2e4c8f6c/index.js#L155
 */
export function* itwCheckHasApiLevelSupportSaga(
  itwHasApiLevelSupported: (typeof cieManager)["hasApiLevelSupport"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof itwHasApiLevelSupported> =
      yield* call(itwHasApiLevelSupported);
    yield* put(itwHasApiLevelSupport.success(response));
  } catch (e) {
    yield* put(itwHasApiLevelSupport.failure(convertUnknownToError(e)));
  }
}

/**
 * check if the device has the NFC Feature to support CIE authentication
 * see https://github.com/pagopa/io-cie-android-sdk/blob/29cc1165bbd3d90d61239369f22ec78b2e4c8f6c/index.js#L169
 */
export function* itwCheckitwHasNFCFeatureSaga(
  itwHasNFCFeatureSupported: (typeof cieManager)["hasNFCFeature"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof itwHasNFCFeatureSupported> =
      yield* call(itwHasNFCFeatureSupported);
    yield* put(itwHasNFCFeature.success(response));
  } catch (e) {
    yield* put(itwHasNFCFeature.failure(convertUnknownToError(e)));
  }
}

/**
 * check if the device is compatible with CIE authentication
 * see https://github.com/pagopa/io-cie-android-sdk/blob/29cc1165bbd3d90d61239369f22ec78b2e4c8f6c/index.js#L125
 */
export function* itwCheckCieAvailabilitySaga(
  isCIEAuthenticationSupported: (typeof cieManager)["isCIEAuthenticationSupported"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof isCIEAuthenticationSupported> =
      yield* call(isCIEAuthenticationSupported);
    yield* put(itwCieIsSupported.success(response));
  } catch (e) {
    yield* put(itwCieIsSupported.failure(convertUnknownToError(e)));
  }
}
const CIE_NFC_STATUS_INTERVAL = 1500 as Millisecond;
/**
 * checks if the nfc is enabled. If it is NOT enbled it checks again with a delay
 */
export function* itwCheckNfcEnablementSaga(): SagaIterator {
  try {
    while (true) {
      const isNfcEnabled: SagaCallReturnType<typeof cieManager.isNFCEnabled> =
        yield* call(cieManager.isNFCEnabled);
      yield* put(itwNfcIsEnabled.success(isNfcEnabled));
      if (isNfcEnabled) {
        return;
      }
      // TODO find a way to break this loop: if the user leave the CIE authentication this loop
      // will continue, instead it has to be stopped
      // wait and check again
      yield* call(startTimer, CIE_NFC_STATUS_INTERVAL);
    }
  } catch (e) {
    yield* put(itwNfcIsEnabled.failure(convertUnknownToError(e))); // TODO: check e type
  }
}
