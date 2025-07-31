import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwSecurePreferencesState } from "../reducers/securePreferences";

export const ITW_MAX_OFFLINE_ACCESS_COUNTER = 5;
export const ITW_WARNING_OFFLINE_ACCESS_COUNTER = 3;

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
 */
export const itwShouldDisplayOfflineAccessLimitWarning = createSelector(
  itwOfflineAccessCounterSelector,
  offlineAccessCounter =>
    offlineAccessCounter === ITW_WARNING_OFFLINE_ACCESS_COUNTER
);
