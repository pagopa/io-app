import { SagaIterator } from "redux-saga";
import { call, fork, select, takeEvery } from "typed-redux-saga/macro";
import { registerSuperProperties } from "../../../../mixpanel.ts";
import { GlobalState } from "../../../../store/reducers/types";
import { getNfcAntennaInfo, isHceSupported } from "../../../../utils/nfc";
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
 * Tracks NFC information for discovery and debugging purposes.
 * TODO remove this function when NFC info tracking is not needed anymore
 */
export function* updateNfcInfoTrackingProperties() {
  try {
    const { deviceHeight, deviceWidth, availableNfcAntennas } = yield* call(
      getNfcAntennaInfo
    );

    const hasDeviceInfo = deviceHeight !== 0 && deviceWidth !== 0;
    const antennaCount = availableNfcAntennas.length;

    registerSuperProperties({
      NFC_ANTENNA_HAS_DEVICE_INFO: hasDeviceInfo,
      NFC_AVAILABLE_ANTENNAS: antennaCount
    });
  } catch (e) {
    const errorName = e instanceof Error ? e.name : String(e);
    registerSuperProperties({
      NFC_ANTENNA_READ_FAILURE: errorName
    });
  }

  try {
    const isSupported = yield* call(isHceSupported);

    registerSuperProperties({
      NFC_HAS_HCE_SUPPORT: isSupported
    });
  } catch (e) {
    const errorName = e instanceof Error ? e.name : String(e);
    registerSuperProperties({
      NFC_HCE_READ_FAILURE: errorName
    });
  }
}
