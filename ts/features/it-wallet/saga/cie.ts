import cieManager from "@pagopa/react-native-cie";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import {
  cieIsSupported,
  hasApiLevelSupport,
  hasNFCFeature,
  nfcIsEnabled
} from "../store/actions/cie";
import { SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError } from "../../../utils/errors";
import { startTimer } from "../../../utils/timer";

export function* watchCieAuthenticationSaga(): SagaIterator {
  // Trigger a saga on nfcIsEnabled to check if NFC is enabled or not
  yield* takeLatest(nfcIsEnabled.request, checkNfcEnablementSaga);
  // check if the device is compliant with CIE authentication
  yield* call(
    checkCieAvailabilitySaga,
    cieManager.isCIEAuthenticationSupported
  );
  // check if the device has the API Level compliant with CIE authentication
  yield* call(checkHasApiLevelSupportSaga, cieManager.hasApiLevelSupport);
  // check if the device has the NFC Feature to support CIE authentication
  yield* call(checkHasNfcFeatureSaga, cieManager.hasNFCFeature);
}

// stop cie manager to listen nfc tags
export function* stopCieManager(): SagaIterator {
  try {
    yield* call(cieManager.stopListeningNFC);
  } catch {
    // just ignore
  }
}

/**
 * check if the device has the API Level to support CIE authentication
 * see https://github.com/pagopa/io-cie-android-sdk/blob/29cc1165bbd3d90d61239369f22ec78b2e4c8f6c/index.js#L155
 */
export function* checkHasApiLevelSupportSaga(
  hasApiLevelSupported: typeof cieManager["hasApiLevelSupport"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof hasApiLevelSupported> =
      yield* call(hasApiLevelSupported);
    yield* put(hasApiLevelSupport.success(response));
  } catch (e) {
    yield* put(hasApiLevelSupport.failure(convertUnknownToError(e)));
  }
}

/**
 * check if the device has the NFC Feature to support CIE authentication
 * see https://github.com/pagopa/io-cie-android-sdk/blob/29cc1165bbd3d90d61239369f22ec78b2e4c8f6c/index.js#L169
 */
export function* checkHasNfcFeatureSaga(
  hasNfcFeatureSupported: typeof cieManager["hasNFCFeature"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof hasNfcFeatureSupported> =
      yield* call(hasNfcFeatureSupported);
    yield* put(hasNFCFeature.success(response));
  } catch (e) {
    yield* put(hasNFCFeature.failure(convertUnknownToError(e)));
  }
}

/**
 * check if the device is compatible with CIE authentication
 * see https://github.com/pagopa/io-cie-android-sdk/blob/29cc1165bbd3d90d61239369f22ec78b2e4c8f6c/index.js#L125
 */
export function* checkCieAvailabilitySaga(
  isCIEAuthenticationSupported: typeof cieManager["isCIEAuthenticationSupported"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof isCIEAuthenticationSupported> =
      yield* call(isCIEAuthenticationSupported);
    yield* put(cieIsSupported.success(response));
  } catch (e) {
    yield* put(cieIsSupported.failure(convertUnknownToError(e)));
  }
}
const CIE_NFC_STATUS_INTERVAL = 1500 as Millisecond;
/**
 * checks if the nfc is enabled. If it is NOT enbled it checks again with a delay
 */
export function* checkNfcEnablementSaga(): SagaIterator {
  try {
    while (true) {
      const isNfcEnabled: SagaCallReturnType<typeof cieManager.isNFCEnabled> =
        yield* call(cieManager.isNFCEnabled);
      yield* put(nfcIsEnabled.success(isNfcEnabled));
      if (isNfcEnabled) {
        return;
      }
      // TODO find a way to break this loop: if the user leave the CIE authentication this loop
      // will continue, instead it has to be stopped
      // wait and check again
      yield* call(startTimer, CIE_NFC_STATUS_INTERVAL);
    }
  } catch (e) {
    yield* put(nfcIsEnabled.failure(convertUnknownToError(e))); // TODO: check e type
  }
}
