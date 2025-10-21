import { isPast } from "date-fns";
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
 * Returns whether the app review modal should be shown.
 */
export const itwIsPendingReviewSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isPendingReview;

/**
 * Returns the authentication level used to obtain the eID.
 */
export const itwAuthLevelSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.authLevel;

/**
 * Returns whether claim values are hidden in credentials detail. Defaults to false.
 */
export const itwIsClaimValueHiddenSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.claimValuesHidden ?? false;

/**
 * Returns whether the user has an already active wallet instance but the actual local wallet is not active.
 * @param state the application global state
 */
export const itwIsWalletInstanceRemotelyActiveSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isWalletInstanceRemotelyActive;

/**
 * Returns whether the fiscal code is whitelisted for L3 features.
 * @param state the application global state
 */
export const itwIsL3EnabledSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isFiscalCodeWhitelisted ?? false;

/**
 * Returns whether the IT-wallet upgrade banner in MDL details is hidden. Defaults to false.
 */
export const itwIsWalletUpgradeMDLDetailsBannerHiddenSelector = (
  state: GlobalState
) =>
  state.features.itWallet.preferences.walletUpgradeMDLDetailsBannerHidden ??
  false;

/**
 * Returns whether the user has the requirements for IT-Wallet simplified activation.
 */
export const itwIsSimplifiedActivationRequired = (state: GlobalState) =>
  state.features.itWallet.preferences.isItwSimplifiedActivationRequired ??
  false;

/**
 * Returns whether the reissuance feedback banner is hidden. Defaults to false.
 */
export const itwIsReissuanceFeedbackBannerHiddenSelector = (
  state: GlobalState
) =>
  state.features.itWallet.preferences.reissuanceFeedbackBannerHidden ?? false;
