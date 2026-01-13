import { addDays, isPast } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { bannerHideDurations, ItwBannerId } from "../reducers/banners";

const itwBannersSelector = (state: GlobalState) =>
  state.features.itWallet.banners;

/**
 * Returns if a specific banner is hidden based on the user's preferences.
 */
export const itwIsBannerHiddenSelector = (id: ItwBannerId) =>
  createSelector(itwBannersSelector, banners => {
    const state = banners[id];
    if (state === undefined) {
      return false;
    }

    const { dismissedOn, dismissCount } = state;
    if (!dismissedOn || dismissCount === undefined) {
      // Banners was never dismissed, so it's not hidden
      return false;
    }

    const durations = bannerHideDurations[id];
    const durationIndex = Math.min(dismissCount - 1, durations.length - 1);
    const duration = durations[durationIndex];
    const hiddenUntilDate = addDays(new Date(dismissedOn), duration);
    return !isNaN(hiddenUntilDate.getTime()) && !isPast(hiddenUntilDate);
  });

/**
 * Returns if the discovery banner should be displayed or not based on the user's preferences.
 * The banner should be visible only if the user closed it more than six months ago.
 */
export const itwIsDiscoveryBannerHiddenSelector =
  itwIsBannerHiddenSelector("discovery");

/**
 * Returns whether the IT-wallet upgrade banner in MDL details is hidden. Defaults to false.
 */
export const itwIsWalletUpgradeMDLDetailsBannerHiddenSelector =
  itwIsBannerHiddenSelector("upgradeMDLDetails");
