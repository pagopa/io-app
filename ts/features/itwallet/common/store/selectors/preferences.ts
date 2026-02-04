import { GlobalState } from "../../../../../store/reducers/types";

export const itwPreferencesSelector = (state: GlobalState) =>
  state.features.itWallet.preferences;

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
 * Returns whether the user has the requirements for IT-Wallet simplified activation.
 */
export const itwIsSimplifiedActivationRequired = (state: GlobalState) =>
  state.features.itWallet.preferences.isItwSimplifiedActivationRequired ??
  false;

/**
 * Selects the state that indicates whether the bottom sheet of survey is visible.
 * Returns `true` if the bottom sheet is visible, `false` if the user has already
 * checked the survey, with the state being persisted through Redux.
 */
export const itwIsPidReissuingSurveyHiddenSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isPidReissuingSurveyHidden;

/**
 * Returns the list of credential IDs that failed the upgrade process.
 */
export const itwCredentialUpgradeFailedSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.credentialUpgradeFailed ?? [];
