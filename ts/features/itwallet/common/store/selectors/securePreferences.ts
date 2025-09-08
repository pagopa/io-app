import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwSecurePreferencesState } from "../reducers/securePreferences";
import { progressSelector } from "../../../../identification/store/selectors";

// 5 means that the fifth time the user accesses the app offline, they will be required to return online.
export const ITW_MAX_OFFLINE_ACCESS_COUNTER = 5;

const selectSecurePreferencesSlice = (
  state: GlobalState
): ItwSecurePreferencesState => state.features.itWallet.securePreferences;

/**
 * Returns the number of offline accesses that the user can perform
 * before being required to return online.
 */
export const itwOfflineAccessCounterSelector = createSelector(
  selectSecurePreferencesSlice,
  securePreferences => securePreferences.offlineAccessCounter
);

/**
 * Returns `true` if the user has reached the maximum number of offline accesses
 */
export const itwIsOfflineAccessLimitReached = createSelector(
  itwOfflineAccessCounterSelector,
  offlineAccessCounter => offlineAccessCounter >= ITW_MAX_OFFLINE_ACCESS_COUNTER
);

/**
 * Returns `true` if the user should be warned about the offline access limit
 * before reaching it.
 *
 * TODO: [SIW-2892] Revise this workaround
 * The check on the `identificationProgress` status was added to mitigate the issue
 * caused by the delay between the update of `startupStatus` (whose value, when offline, renders the `OfflineStackNavigator`)
 * and that of the underlying counter (which also responds to the `startupLoadSuccess` action).
 * This delay gives rise to an edge case during the transition from 1 remaining attempt to no attempts left,
 * causing — in the render just before the counter update — the incorrect dispatch of the `ITW_OFFLINE_ACCESS_EXPIRING` event
 */
export const itwShouldDisplayOfflineAccessLimitWarning = createSelector(
  itwOfflineAccessCounterSelector,
  progressSelector,
  (offlineAccessCounter, identificationProgress) =>
    offlineAccessCounter === ITW_MAX_OFFLINE_ACCESS_COUNTER - 1 &&
    identificationProgress.kind === "identified"
);
