import { isItwOfflineAccessEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../../store/reducers/types";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import {
  itwCredentialsEidStatusSelector,
  itwIsWalletEmptySelector
} from "../../../credentials/store/selectors";
import {
  itwLifecycleIsOperationalOrValid,
  itwLifecycleIsValidSelector
} from "../../../lifecycle/store/selectors";
import { itwIsWalletInstanceStatusFailureSelector } from "../../../walletInstance/store/selectors";
import {
  itwAuthLevelSelector,
  itwIsDiscoveryBannerHiddenSelector,
  itwIsFeedbackBannerHiddenSelector,
  itwIsL3EnabledSelector
} from "./preferences";
import {
  isItwEnabledSelector,
  isItwFeedbackBannerEnabledSelector
} from "./remoteConfig";

/**
 * Returns if the discovery banner should be rendered. The banner is rendered if:
 * - The Wallet is not already activated and valid
 * - The IT Wallet feature flag is enabled
 * - The L3 feature flag is disabled
 * @param state the application global state
 * @returns true if the banner should be rendered, false otherwise
 */
export const isItwDiscoveryBannerRenderableSelector = (state: GlobalState) =>
  !itwLifecycleIsValidSelector(state) &&
  isItwEnabledSelector(state) &&
  !itwIsL3EnabledSelector(state);

/**
 * Returns the renderable state of the discovery banner with the persisted user's preference:
 * after being closed by the user it should stay hidden for 6 months.
 */
export const isItwPersistedDiscoveryBannerRenderableSelector = (
  state: GlobalState
) =>
  !itwIsDiscoveryBannerHiddenSelector(state) &&
  isItwDiscoveryBannerRenderableSelector(state);

/**
 * Returns if the feedback banner should be visible. The banner is visible if:
 * - The Wallet has valid Wallet Instance and a valid eID
 * - The Wallet has at least one credential
 * - The user did not close the banner
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderFeedbackBannerSelector = (state: GlobalState) =>
  isItwFeedbackBannerEnabledSelector(state) &&
  itwLifecycleIsValidSelector(state) &&
  !itwIsWalletEmptySelector(state) &&
  !itwIsFeedbackBannerHiddenSelector(state);

/**
 * Returns if the wallet ready banner should be visible. The banner is visible if:
 * - The Wallet has valid Wallet Instance with a known status, and a valid eID
 * - The eID is not expired
 * - The Wallet is empty
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderWalletReadyBannerSelector = (state: GlobalState) =>
  itwLifecycleIsValidSelector(state) &&
  !itwIsWalletInstanceStatusFailureSelector(state) &&
  itwCredentialsEidStatusSelector(state) !== "jwtExpired" &&
  itwIsWalletEmptySelector(state);

/**
 * Selectors that returns if the wallet is available for offline access. It joins three
 * selectors:
 * - if the wallet is operation or valid
 * - if the wallet contains at least one credential
 * - if the offline access is enabled
 */
export const itwOfflineAccessAvailableSelector = (state: GlobalState) =>
  isItwOfflineAccessEnabledSelector(state) &&
  itwLifecycleIsOperationalOrValid(state) &&
  state.features.itWallet.credentials.credentials.length > 0;

/**
 * Returns if the L3 upgrade banner should be rendered. The banner is rendered if:
 * - The IT Wallet feature flag is enabled
 * - The wallet is not offline
 * - The L3 feature flag is enabled
 * - The wallet is not already with L3 auth
 */
export const itwShouldRenderL3UpgradeBannerSelector = (state: GlobalState) =>
  isItwEnabledSelector(state) &&
  !offlineAccessReasonSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  itwAuthLevelSelector(state) !== "L3";
