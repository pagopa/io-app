import { fork, select, takeEvery } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";
import { GlobalState } from "../../../../store/reducers/types";
import { updateItwAnalyticsProperties } from "../properties/propertyUpdaters";
import {
  itwCredentialsStore,
  itwCredentialsRemove
} from "../../credentials/store/actions";
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
}

export function* watchItwCredentialsAnalyticsSaga(): SagaIterator {
  yield* takeEvery(itwCredentialsStore, handleCredentialStoredAnalytics);
  yield* takeEvery(itwCredentialsRemove, handleCredentialRemovedAnalytics);
}
