import { isPast } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwPreferencesState } from "../reducers/preferences";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { itwIsWalletEmptySelector } from "../../../credentials/store/selectors";

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

    return !isPast(hideFeedbackBanner.before);
  }
);

/**
 * Returns if the feedback banner should be visible. The banner is visible if:
 * - The Wallet has valid Wallet Instance and a valid eID
 * - The Wallet has at least one credential
 * - The user did not close the banner
 */
export const itwShouldRenderFeedbackBanner = createSelector(
  itwLifecycleIsValidSelector,
  itwIsWalletEmptySelector,
  itwIsFeedbackBannerHiddenSelector,
  (isItwValid, isWalletEmpty, isBannerHidden) =>
    isItwValid && !isWalletEmpty && !isBannerHidden
);
