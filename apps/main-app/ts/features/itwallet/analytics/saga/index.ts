import { SagaIterator } from "redux-saga";
import { fork, select, takeEvery } from "typed-redux-saga/macro";

import { GlobalState } from "../../../../store/reducers/types";
import { itwSetCredentialUpgradeFailed } from "../../common/store/actions/preferences";
import {
  itwCredentialsRemove,
  itwCredentialsStore
} from "../../credentials/store/actions";
import { itwFetchCredentialsCatalogue } from "../../credentialsCatalogue/store/actions";
import { updateItwAnalyticsProperties } from "../properties/propertyUpdaters";
import {
  handleAggregateCredentialPropertiesRefresh,
  handleCredentialRemovedAnalytics,
  handleCredentialStoredAnalytics
} from "./credentialAnalyticsHandlers";

/**
 * Saga that performs a full sync of all ITW analytics properties (Profile +
 * Super) using the current state.
 */
export function* syncItwAnalyticsProperties() {
  const state: GlobalState = yield* select();
  updateItwAnalyticsProperties(state);
}

export function* watchItwAnalyticsSaga(): SagaIterator {
  // Aligns Mixpanel with current IT-Wallet state
  yield* fork(syncItwAnalyticsProperties);

  // Keep analytics in sync with store changes
  yield* fork(watchItwCredentialsAnalyticsSaga);
}

export function* watchItwCredentialsAnalyticsSaga(): SagaIterator {
  yield* takeEvery(itwCredentialsStore, handleCredentialStoredAnalytics);
  yield* takeEvery(itwCredentialsRemove, handleCredentialRemovedAnalytics);
  yield* takeEvery(
    [itwFetchCredentialsCatalogue.success, itwSetCredentialUpgradeFailed],
    handleAggregateCredentialPropertiesRefresh
  );
}
