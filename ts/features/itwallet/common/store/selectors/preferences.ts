import { isPast } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwPreferencesState } from "../reducers/preferences";

export const itwPreferencesSelector = (state: GlobalState) =>
  state.features.itWallet.preferences;

/**
 * Returns if the feedback banner should be displayed or not based on the user's preferences.
 * The banner should be visible only if the user closed it more than one month ago
 * and has not given feedback.
 */
export const itwIsFeedbackBannerHiddenSelector = createSelector(
  itwPreferencesSelector,
  ({ hideFeedbackBannerUntilDate }: ItwPreferencesState) => {
    if (!hideFeedbackBannerUntilDate) {
      return false;
    }

    const hideUntilDate = new Date(hideFeedbackBannerUntilDate);

    return !isNaN(hideUntilDate.getTime()) && !isPast(hideUntilDate);
  }
);
