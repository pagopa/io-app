import { addHours, isFuture, isPast } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwPreferencesState } from "../reducers/preferences";

const isPastDate = (date?: string) => {
  if (!date) {
    return false;
  }
  const hideUntilDate = new Date(date);
  return !isNaN(hideUntilDate.getTime()) && !isPast(hideUntilDate);
};

export const itwPreferencesSelector = (state: GlobalState) =>
  state.features.itWallet.preferences;

/**
 * Returns if the feedback banner should be displayed or not based on the user's preferences.
 * The banner should be visible only if the user closed it more than one month ago
 * and has not given feedback.
 */
export const itwIsFeedbackBannerHiddenSelector = createSelector(
  itwPreferencesSelector,
  ({ hideFeedbackBannerUntilDate }: ItwPreferencesState) =>
    isPastDate(hideFeedbackBannerUntilDate)
);

/**
 * Returns if the discovery banner should be displayed or not based on the user's preferences.
 * The banner should be visible only if the user closed it more than six months ago.
 */
export const itwIsDiscoveryBannerHiddenSelector = createSelector(
  itwPreferencesSelector,
  ({ hideDiscoveryBannerUntilDate }: ItwPreferencesState) =>
    isPastDate(hideDiscoveryBannerUntilDate)
);

/**
 * Returns the list of requested credentials in the past 7 days.
 */
export const itwRequestedCredentialsSelector = createSelector(
  itwPreferencesSelector,
  ({ requestedCredentials }: ItwPreferencesState) =>
    Object.entries(requestedCredentials)
      // This acts as a soft boolean flag: it is unlikely to happen that a credential remains
      // in the "requested" status for this long. This allows for flexibility to adjust the
      // timeframe in the future if needed.
      // 09/01/25: The timeframe has been adjusted to 24 hours to match the new requirements.
      .filter(([_, requestedAt]) => isFuture(addHours(requestedAt, 24)))
      .map(([credentialType]) => credentialType)
);

/**
 * Returns whether the app review modal should be shown.
 */
export const itwIsPendingReviewSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isPendingReview;
