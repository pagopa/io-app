import { addMonths, isPast } from "date-fns";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwCloseFeedbackBanner } from "../actions/preferences";

export type ItwPreferencesState = {
  hideFeedbackBanner?: "always" | { before: Date };
};

const INITIAL_STATE: ItwPreferencesState = {};

const reducer = (
  state: ItwPreferencesState = INITIAL_STATE,
  action: Action
): ItwPreferencesState => {
  switch (action.type) {
    case getType(itwCloseFeedbackBanner): {
      return {
        hideFeedbackBanner: action.payload.withFeedback
          ? "always"
          : { before: addMonths(new Date(), 1) }
      };
    }

    default:
      return state;
  }
};

export const itwPreferencesSelector = (state: GlobalState) =>
  state.features.itWallet.preferences;

/**
 * Returns if the feedback banner should be visible or not.
 * The banner should be visible only if the user closed it more than one month ago
 * and has not given feedback.
 */
export const itwIsFeedbackBannerVisibleSelector = createSelector(
  itwPreferencesSelector,
  ({ hideFeedbackBanner }: ItwPreferencesState) => {
    if (hideFeedbackBanner === undefined) {
      return true;
    }

    if (hideFeedbackBanner === "always") {
      return false;
    }

    return isPast(hideFeedbackBanner.before);
  }
);

export default reducer;
