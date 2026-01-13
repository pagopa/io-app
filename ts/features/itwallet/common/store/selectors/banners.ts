import { isPast } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwBannerId } from "../reducers/banners";

const itwBannersSelector = (state: GlobalState) =>
  state.features.itWallet.banners;

/**
 * Returns if a specific banner is hidden based on the user's preferences.
 */
export const itwIsBannerHiddenSelector = (id: ItwBannerId) =>
  createSelector(itwBannersSelector, banners => {
    const state = banners[id];
    if (!state.hiddenUntil) {
      return false;
    }
    const hiddenUntilDate = new Date(state.hiddenUntil);
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
