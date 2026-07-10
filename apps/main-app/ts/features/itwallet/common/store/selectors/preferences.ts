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
 * Returns whether the fiscal code is whitelisted for L3 features.
 * @param state the application global state
 */
export const itwIsL3EnabledSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isFiscalCodeWhitelisted ?? false;

/**
 * Selects the state that indicates whether the bottom sheet of survey is visible.
 * Returns `true` if the bottom sheet is visible, `false` if the user has already
 * checked the survey, with the state being persisted through Redux.
 */
export const itwIsPidReissuingSurveyHiddenSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isPidReissuingSurveyHidden;

/**
 * Returns the list of credential types that failed the upgrade process.
 */
export const itwCredentialUpgradeFailedSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.credentialUpgradeFailed ?? [];

/**
 * Returns the identification mode used for the user.
 */
export const itwIdentificationModeSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.identificationMode;

/**
 * Returns whether IT Wallet activation is disabled (no nfc).
 */
export const itwIsActivationDisabledSelector = (state: GlobalState) =>
  state.features.itWallet.preferences.isItwActivationDisabled ?? false;

const WALLET_ACTIVATION_FEEDBACK_BANNER_VALIDITY_DAYS = 7;

/**
 * Returns the wallet activation feedback banner data if it was stored within the last 7 days,
 * otherwise returns undefined. Used to show the survey banner in WALLET_HOME.
 */
export const itwWalletActivationFeedbackBannerSelector = (
  state: GlobalState
) => {
  const data =
    state.features.itWallet.preferences.walletActivationFeedbackBannerData;
  if (!data) {
    return undefined;
  }
  const addedAtMs = new Date(data.date).getTime();
  const validityMs =
    WALLET_ACTIVATION_FEEDBACK_BANNER_VALIDITY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - addedAtMs <= validityMs ? data : undefined;
};
