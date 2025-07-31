import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwSecurePreferencesState } from "../reducers/securePreferences";

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
