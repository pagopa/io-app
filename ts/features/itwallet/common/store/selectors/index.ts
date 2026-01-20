import { GlobalState } from "../../../../../store/reducers/types";
import { isConnectedSelector } from "../../../../connectivity/store/selectors";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import {
  itwCredentialsEidStatusSelector,
  itwIsWalletEmptySelector
} from "../../../credentials/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsOperationalOrValid,
  itwLifecycleIsValidSelector
} from "../../../lifecycle/store/selectors";
import { itwIsWalletInstanceStatusFailureSelector } from "../../../walletInstance/store/selectors";
import {
  itwIsDiscoveryBannerHiddenSelector,
  itwIsWalletUpgradeMDLDetailsBannerHiddenSelector
} from "./banners";
import { itwIsL3EnabledSelector } from "./preferences";
import { isItwEnabledSelector } from "./remoteConfig";

/**
 * Returns if the discovery banner should be rendered. The banner is rendered if:
 * - The user has online access (not available in the mini-app)
 * - The Wallet is not already activated and valid
 * - The IT Wallet feature flag is enabled
 * - The L3 feature flag is disabled
 * @param state the application global state
 * @returns true if the banner should be rendered, false otherwise
 */
export const isItwDiscoveryBannerRenderableSelector = (state: GlobalState) =>
  !offlineAccessReasonSelector(state) &&
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
 * Returns if the wallet ready banner should be visible. The banner is visible if:
 * - The user has online access (not available in the mini-app)
 * - The Wallet has valid Wallet Instance with a known status, and a valid eID
 * - The Wallet Instance is not in a failure status
 * - The eID is not expired or expiring
 * - The Wallet is empty
 * - Fiscal code is not whitelisted for IT-Wallet L3
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderWalletReadyBannerSelector = (state: GlobalState) =>
  !offlineAccessReasonSelector(state) &&
  itwLifecycleIsValidSelector(state) &&
  !itwIsWalletInstanceStatusFailureSelector(state) &&
  itwCredentialsEidStatusSelector(state) !== "jwtExpired" &&
  itwCredentialsEidStatusSelector(state) !== "jwtExpiring" &&
  itwIsWalletEmptySelector(state);

/**
 * Selectors that returns if the wallet is available for offline access. It joins three
 * selectors:
 * - if the wallet is operation or valid
 * - if the wallet contains at least one credential
 */
export const itwOfflineAccessAvailableSelector = (state: GlobalState) =>
  itwLifecycleIsOperationalOrValid(state) && !itwIsWalletEmptySelector(state);

/**
 * Returns if the L3 upgrade banner should be rendered. The banner is rendered if:
 * - The user has online access (not available in the mini-app)
 * - The IT Wallet feature flag is enabled
 * - The L3 feature flag is enabled
 * - Isn't ITW Credential
 */
export const itwShouldRenderL3UpgradeBannerSelector = (state: GlobalState) =>
  !offlineAccessReasonSelector(state) &&
  isItwEnabledSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  !itwLifecycleIsITWalletValidSelector(state);

/**
 * Returns whether the new IT-Wallet variant should be rendered.
 * - The IT Wallet feature flag is enabled
 * - The wallet is not offline
 * - Is ITW Valid
 */
export const itwShouldRenderNewItWalletSelector = (state: GlobalState) =>
  isItwEnabledSelector(state) &&
  !offlineAccessReasonSelector(state) &&
  itwLifecycleIsITWalletValidSelector(state);

/**
 * Returns whether the IT-Wallet upgrade banner in MDL details should be rendered.
 * - The IT Wallet feature flag is enabled
 * - The wallet is not offline
 * - The L3 feature flag is enabled
 * - Isn't ITW Credential
 * - The user did not close the banner
 */
export const itwShouldRenderWalletUpgradeMDLDetailsBannerSelector = (
  state: GlobalState
): boolean =>
  isItwEnabledSelector(state) &&
  !offlineAccessReasonSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  !itwLifecycleIsITWalletValidSelector(state) &&
  !itwIsWalletUpgradeMDLDetailsBannerHiddenSelector(state);

/**
 * Returns whether the eID lifecycle alert should be hidden in wallet.
 * When the ITW upgrade banner is displayed, the eID lifecycle alert
 * is hidden so that the user does not need to perform eID reissuance.
 * The alert is hidden if:
 * - The new IT Wallet design is being rendered
 * - The L3 upgrade banner is being displayed
 * - The eID is expiring and the device is offline
 */
export const itwShouldHideEidLifecycleAlert = (state: GlobalState): boolean =>
  itwShouldRenderNewItWalletSelector(state) ||
  itwShouldRenderL3UpgradeBannerSelector(state) ||
  (itwCredentialsEidStatusSelector(state) === "jwtExpiring" &&
    !isConnectedSelector(state));

/**
 * Returns whether the new IT-Wallet activation banner should be rendered.
 * - The IT Wallet feature flag is enabled
 * - The wallet is not offline
 * - The L3 feature flag is enabled
 * - The wallet is not valid (not yet active)
 */
export const itwShouldRenderDiscoveryBannerSelector = (state: GlobalState) =>
  isItwEnabledSelector(state) &&
  !offlineAccessReasonSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  !itwLifecycleIsValidSelector(state);

/**
 * Returns whether the new IT-Wallet upgrade banner should be rendered.
 * - The IT Wallet feature flag is enabled
 * - The wallet is not offline
 * - The L3 feature flag is enabled
 * - The wallet is active but not an IT Wallet istance
 */
export const itwShouldRenderUpgradeBannerSelector = (state: GlobalState) =>
  isItwEnabledSelector(state) &&
  !offlineAccessReasonSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  !itwLifecycleIsITWalletValidSelector(state);
