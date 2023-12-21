import { ProximityManager } from "@pagopa/io-react-native-proximity";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import {
  ProximityManagerStatusEnum,
  bleIsEnabled,
  generateQrCode,
  proximityManagerStatus,
  startProximityManager,
  stopProximityManager
} from "../store/actions/itwProximityActions";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";

export function* watchItwProximitySaga(): SagaIterator {
  // Trigger a saga on bleIsEnabled to check if BLE is enabled or not
  yield* takeLatest(bleIsEnabled.request, checkBleEnablementSaga);

  // Start Proximity Manager
  yield* takeLatest(
    startProximityManager.request,
    handleStartProximityManagerSaga
  );

  // Get QR code request
  yield* takeLatest(generateQrCode.request, handleGenerateQrCodeSaga);

  // Stop Proximity Manager
  yield* takeLatest(
    stopProximityManager.request,
    handleStopProximityManagerSaga
  );
}

// start proximity manager
function* handleStartProximityManagerSaga(): SagaIterator {
  try {
    yield* call(ProximityManager.start);
    yield* put(startProximityManager.success(true));
    yield* put(generateQrCode.request());
  } catch {
    yield* put(
      startProximityManager.failure({
        code: ItWalletErrorTypes.PROXIMITY_GENERIC_ERROR
      })
    );
  }
}

// generate qr code
function* handleGenerateQrCodeSaga(): SagaIterator {
  try {
    const qrCode = yield* call(ProximityManager.generateQrCode);
    yield* put(generateQrCode.success(qrCode));
    yield* put(
      proximityManagerStatus({
        status: ProximityManagerStatusEnum.STARTED
      })
    );
  } catch {
    yield* put(
      generateQrCode.failure({
        code: ItWalletErrorTypes.PROXIMITY_GENERIC_ERROR
      })
    );
  }
}

// stop proximity manager
function* handleStopProximityManagerSaga(): SagaIterator {
  try {
    // TODO: remove all listners before stopping the proximity manager
    // we need a new method in the proximity manager [SIW-775]
    yield* call(ProximityManager.stop);
    yield* put(stopProximityManager.success(true));
  } catch {
    yield* put(
      stopProximityManager.failure({
        code: ItWalletErrorTypes.PROXIMITY_GENERIC_ERROR
      })
    );
  }
  yield* put(
    proximityManagerStatus({
      status: ProximityManagerStatusEnum.STOPPED
    })
  );
}

/**
 * checks if the ble is enabled. If it is NOT enbled it checks again with a delay
 */
export function* checkBleEnablementSaga(): SagaIterator {
  // TODO: to check ble enablement we need to use the proximity manager
  // but we need to update the proximity manager with a new method
  // to check if ble is enabled [SIW-774]
  yield* put(bleIsEnabled.success(true));
}
