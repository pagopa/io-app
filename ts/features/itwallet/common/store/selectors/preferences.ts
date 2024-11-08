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
  ({ hideFeedbackBanner }: ItwPreferencesState) => {
    if (hideFeedbackBanner === undefined) {
      return false;
    }

    if (hideFeedbackBanner === "always") {
      return true;
    }

    return !isPast(hideFeedbackBanner.until);
  }
);
