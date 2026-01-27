import { SagaIterator } from "redux-saga";
import { call, fork, select, takeEvery } from "typed-redux-saga/macro";
import { registerSuperProperties } from "../../../../mixpanel.ts";
import { GlobalState } from "../../../../store/reducers/types";
import { getNfcAntennaInfo } from "../../../../utils/nfc";
import {
  itwCredentialsRemove,
  itwCredentialsStore
} from "../../credentials/store/actions";
import { updateItwAnalyticsProperties } from "../properties/propertyUpdaters";
import {
  handleCredentialRemovedAnalytics,
  handleCredentialStoredAnalytics
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
}

export function* watchItwCredentialsAnalyticsSaga(): SagaIterator {
  yield* takeEvery(itwCredentialsStore, handleCredentialStoredAnalytics);
  yield* takeEvery(itwCredentialsRemove, handleCredentialRemovedAnalytics);
}

/**
 * Tracks NFC antenna information for discovery and debugging purposes.
 * TODO remove this function when NFC antenna info tracking is not needed anymore
 */
export function* updateNfcAntennaInfoTrackingProperties() {
  try {
    const { deviceHeight, deviceWidth, availableNfcAntennas } = yield* call(
      getNfcAntennaInfo
    );

    registerSuperProperties({
      NFC_ANTENNA_HAS_DEVICE_INFO: deviceHeight !== 0 && deviceWidth !== 0,
      NFC_AVAILABLE_ANTENNAS: availableNfcAntennas?.length || 0
    });
  } catch (e) {
    registerSuperProperties({
      NFC_ANTENNA_READ_FAILURE: e instanceof Error ? `${e.name}` : String(e)
    });
  }
}
