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
    const bannerState = banners[id];

    // Banner has no state, so it's visible
    if (!bannerState) {
      return false;
    }

    const { dismissedOn, dismissCount } = bannerState;

    // Banner was never dismissed, so it's visible
    if (!dismissedOn || !dismissCount || dismissCount <= 0) {
      return false;
    }

    const durations = bannerHideDurations[id];

    // Safety check: ensure durations array is valid
    if (!durations || durations.length === 0) {
      return false;
    }

    const durationIndex = Math.min(dismissCount - 1, durations.length - 1);
    const hideDurationInDays = durations[durationIndex];

    const dismissedDate = new Date(dismissedOn);

    // Invalid date, show the banner
    if (isNaN(dismissedDate.getTime())) {
      return false;
    }

    const hiddenUntilDate = addDays(dismissedDate, hideDurationInDays);

    // Banner is hidden if the hide period has not yet passed
    return !isPast(hiddenUntilDate);
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

/** Returns whether the IT-wallet discovery banner in wallet screen is hidden. Defaults to false.
 */
export const itwIsWalletDiscoveryBannerHiddenSelector =
  itwIsBannerHiddenSelector("discovery_wallet");

/** Returns whether the IT-wallet discovery banner in messages inbox screen is hidden. Defaults to false.
 */
export const itwIsInboxDiscoveryBannerHiddenSelector =
  itwIsBannerHiddenSelector("discovery_messages_inbox");

/** Returns whether the IT-wallet restricted mode banner is open. Defaults to false.
 */
export const itwRestrictedModeOpenSelector = (state: GlobalState) => {
  const rm = state.features.itWallet.banners.restrictedMode;
  return Boolean(rm && !rm.dismissedOn);
};

/** Returns whether the IT-wallet banner is due to be shown.
 * */
export const itwIsBannerDueSelector =
  (bannerId: ItwBannerId) => (state: GlobalState) => {
    const b = state.features.itWallet.banners[bannerId];
    if (!b?.showFrom) {
      return false;
    }

    return Date.now() >= new Date(b.showFrom).getTime();
  };
