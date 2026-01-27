import { call, fork, select, takeEvery } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";
import { GlobalState } from "../../../../store/reducers/types";
import { updateItwAnalyticsProperties } from "../properties/propertyUpdaters";
import {
  itwCredentialsStore,
  itwCredentialsRemove
} from "../../credentials/store/actions";
import { registerSuperProperties } from "../../../../mixpanel.ts";
import { getNfcAntennaInfo } from "../../../../utils/nfc.ts";
import {
  handleCredentialStoredAnalytics,
  handleCredentialRemovedAnalytics
} from "./credentialAnalyticsHandlers";

export function* watchItwAnalyticsSaga(): SagaIterator {
  // Aligns Mixpanel with current IT-Wallet state
  yield* fork(syncItwAnalyticsProperties);

  // Keep analytics in sync with store changes
  yield* fork(watchItwCredentialsAnalyticsSaga);
}

/**
 * Saga that performs a full sync of all ITW analytics properties
 * (Profile + Super) using the current state.
 */
export function* syncItwAnalyticsProperties() {
  const state: GlobalState = yield* select();
  updateItwAnalyticsProperties(state);

  // TODO remove this fork when NFC antenna info tracking is not needed anymore
  yield* fork(handleNfcAntennaInfoTracking);
}

export function* watchItwCredentialsAnalyticsSaga(): SagaIterator {
  yield* takeEvery(itwCredentialsStore, handleCredentialStoredAnalytics);
  yield* takeEvery(itwCredentialsRemove, handleCredentialRemovedAnalytics);
}

/**
 * Tracks NFC antenna information for discovery and debugging purposes.
 * TODO remove this function when NFC antenna info tracking is not needed anymore
 */
export function* handleNfcAntennaInfoTracking() {
  try {
    const info = yield* call(getNfcAntennaInfo);
    const { deviceHeight, deviceWidth, availableNfcAntennas } = info || {};

    registerSuperProperties({
      NFC_ANTENNA_HAS_DEVICE_INFO: deviceHeight !== 0 && deviceWidth !== 0,
      NFC_AVAILABLE_ANTENNAS: availableNfcAntennas?.length || 0
    });
  } catch (failure) {
    registerSuperProperties({ NFC_ANTENNA_READ_FAILURE: failure });
  }
}
