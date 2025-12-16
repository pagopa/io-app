import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwSecurePreferencesState } from "../reducers/securePreferences";
import { progressSelector } from "../../../../identification/store/selectors";

// 5 means that the fifth time the user accesses the app offline, they will be required to return online.
export const ITW_MAX_OFFLINE_ACCESS_COUNTER = 5;
export const ITW_MAX_UNVERIFIED_CREDENTIALS_ACCESS_COUNTER = 4;

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
  progressSelector,
  offlineAccessCounter =>
    offlineAccessCounter === ITW_MAX_OFFLINE_ACCESS_COUNTER - 1
);

export const itwUnverifiedCredentialsCounterSelector = createSelector(
  selectSecurePreferencesSlice,
  securePreferences => securePreferences.unverifiedCredentialsAccessCounter
);

/**
 * Returns `true` if the user has reached the maximum number of accesses
 * during IPZS or AS down periods
 */
export const itwUnverifiedCredentialsCounterLimitReached = createSelector(
  itwUnverifiedCredentialsCounterSelector,
  unverifiedCredentialsAccessCounter =>
    unverifiedCredentialsAccessCounter >=
    ITW_MAX_UNVERIFIED_CREDENTIALS_ACCESS_COUNTER
);
