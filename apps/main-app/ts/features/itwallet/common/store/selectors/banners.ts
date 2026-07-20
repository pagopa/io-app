import { addDays, isPast } from "date-fns";
import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import {
  bannerHideDurations,
  bannerVisibleDurations,
  ItwBannerId
} from "../reducers/banners";

const itwBannersSelector = (state: GlobalState) =>
  state.features.itWallet.banners;

/**
 * Returns whether a specific banner should be visible, combining both rules that govern a
 * banner's lifecycle:
 * - Dismiss-cooldown: if the banner was dismissed, it stays hidden until `bannerHideDurations`
 *   has elapsed since the last dismissal, regardless of `shownOn`.
 * - Shown-window: if the banner tracks `shownOn`, it stays visible only within
 *   `bannerVisibleDurations` since it was first triggered. Banners that never set `shownOn`
 *   have no such constraint.
 */
export const itwIsBannerVisibleSelector = (id: ItwBannerId) =>
  createSelector(itwBannersSelector, banners => {
    const bannerState = banners[id];

    // Banner has no state, so it's visible
    if (!bannerState) {
      return true;
    }

    const { dismissedOn, dismissCount, shownOn } = bannerState;

    if (dismissedOn && dismissCount && dismissCount > 0) {
      const durations = bannerHideDurations[id];
      if (durations && durations.length > 0) {
        const durationIndex = Math.min(dismissCount - 1, durations.length - 1);
        const hideDurationInDays = durations[durationIndex];
        const dismissedDate = new Date(dismissedOn);
        if (!isNaN(dismissedDate.getTime())) {
          const hiddenUntilDate = addDays(dismissedDate, hideDurationInDays);
          // Banner is hidden if the hide period has not yet passed
          if (!isPast(hiddenUntilDate)) {
            return false;
          }
        }
      }
    }

    // Banner does not track a shown-window, so it has no further visibility constraint
    if (!shownOn) {
      return true;
    }

    const visibleDurationInDays = bannerVisibleDurations[id];
    if (visibleDurationInDays === undefined) {
      return true;
    }

    const shownDate = new Date(shownOn);
    if (isNaN(shownDate.getTime())) {
      return false;
    }

    const visibleUntilDate = addDays(shownDate, visibleDurationInDays);
    return !isPast(visibleUntilDate);
  });

/**
 * Returns if the discovery banner should be displayed based on the user's preferences.
 * The banner should be visible only if the user closed it more than six months ago.
 */
export const itwIsDiscoveryBannerVisibleSelector =
  itwIsBannerVisibleSelector("discovery");

/**
 * Returns whether the IT-wallet upgrade banner in MDL details is visible. Defaults to true.
 */
export const itwIsWalletUpgradeMDLDetailsBannerVisibleSelector =
  itwIsBannerVisibleSelector("upgradeMDLDetails");

/**
 * Returns whether the Age Verification usage banner in credential details is visible. Defaults to true.
 */
export const itwIsAgeVerificationUsageDetailsBannerVisibleSelector =
  itwIsBannerVisibleSelector("ageVerificationUsageDetails");

/** Returns whether the IT-wallet discovery banner in wallet screen is visible. Defaults to true.
 */
export const itwIsWalletDiscoveryBannerVisibleSelector =
  itwIsBannerVisibleSelector("discovery_wallet");

/** Returns whether the IT-wallet discovery banner in messages inbox screen is visible. Defaults to true.
 */
export const itwIsInboxDiscoveryBannerVisibleSelector =
  itwIsBannerVisibleSelector("discovery_messages_inbox");

/**
 * Returns whether the eID activation success feedback banner should be displayed: it must have been
 * triggered, still be within its 7-day visibility window, and not have been dismissed.
 */
export const itwIsActivationSuccessFeedbackBannerVisibleSelector =
  itwIsBannerVisibleSelector("activationSuccessFeedback");
