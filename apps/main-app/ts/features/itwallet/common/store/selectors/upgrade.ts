import { GlobalState } from "../../../../../store/reducers/types";
import { isConnectedSelector } from "../../../../connectivity/store/selectors";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import {
  itwAreEidAndAnyCredentialExpiredSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { itwIsWalletDiscoveryBannerVisibleSelector } from "./banners";
import {
  itwIsL2FallbackSelector,
  itwIsL3EnabledSelector,
  itwShouldRenderNewItWalletSelector
} from "./index";
import { itwIsActivationDisabledSelector } from "./preferences";
import { isItwEnabledSelector } from "./remoteConfig";

/*
 * Selectors for the upgrade from Documenti su IO (L2) to IT-Wallet (L3).
 *
 * They are layered: each level adds a single concern to the previous one, from
 * what the user and the device are able to do, to what the wallet screen
 * renders.
 *
 * itwCanUpgradeToL3Selector                    user and device capabilities
 *   └ itwIsL3UpgradeOfferedSelector            + not an L2-fallback user
 *       ├ itwShouldHideEidLifecycleAlert
 *       ├ itwShouldRenderUpgradeBannerSelector
 *       └ itwShouldRenderNonDismissibleUpgradeBannerSelector
 *
 * The banners and the eID lifecycle alert compete for the same space: when the
 * eID and at least one credential are expired the alert takes the place of the
 * banners, otherwise the banners take the place of the alert.
 */

/**
 * Returns whether the user and the device are able and entitled to upgrade to
 * IT-Wallet (L3). It never depends on the UI (banners, dismissals, which alert
 * is shown), only on:
 *
 * - The user has online access (not available in the mini-app)
 * - The IT Wallet and L3 feature flags are enabled
 * - The user does not already have an IT-Wallet eID
 * - The activation is not disabled (e.g. the device does not have the nfc)
 */
export const itwCanUpgradeToL3Selector = (state: GlobalState) =>
  offlineAccessReasonSelector(state) === undefined &&
  isItwEnabledSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  !itwLifecycleIsITWalletValidSelector(state) &&
  !itwIsActivationDisabledSelector(state);

/**
 * Returns whether the upgrade to IT-Wallet is proactively offered to the user
 * (banner, or eID lifecycle alert pointing to the discovery screen). Users who
 * activated Documenti su IO through a fallback are excluded: they are targeted
 * by the L2 engagement banner instead.
 */
export const itwIsL3UpgradeOfferedSelector = (state: GlobalState) =>
  itwCanUpgradeToL3Selector(state) && !itwIsL2FallbackSelector(state);

/**
 * Returns whether the upgrade banner should be rendered:
 *
 * - The upgrade is offered
 * - The eID lifecycle alert does not take over (eID and a credential expired)
 * - The banner was not dismissed
 */
export const itwShouldRenderUpgradeBannerSelector = (state: GlobalState) =>
  itwIsL3UpgradeOfferedSelector(state) &&
  !itwAreEidAndAnyCredentialExpiredSelector(state) &&
  itwIsWalletDiscoveryBannerVisibleSelector(state);

/**
 * Returns whether the non-dismissible upgrade banner should be rendered:
 *
 * - The upgrade is offered
 * - The eID is expired (but not together with a credential, where the alert takes
 *   over)
 * - The dismissible banner is not visible
 */
export const itwShouldRenderNonDismissibleUpgradeBannerSelector = (
  state: GlobalState
) =>
  itwIsL3UpgradeOfferedSelector(state) &&
  !itwAreEidAndAnyCredentialExpiredSelector(state) &&
  !itwIsWalletDiscoveryBannerVisibleSelector(state) &&
  itwCredentialsEidStatusSelector(state) === "jwtExpired";

/**
 * Returns whether the eID lifecycle alert should be hidden in wallet. When the
 * upgrade is offered the alert is hidden, unless the eID and at least one other
 * credential are expired. The alert is hidden if:
 *
 * - The new IT Wallet design is rendered (unless the eID is expired or invalid)
 * - The upgrade is offered (unless the eID and a credential are expired)
 * - The eID is expiring and the device is offline
 */
export const itwShouldHideEidLifecycleAlert = (state: GlobalState): boolean => {
  const eidStatus = itwCredentialsEidStatusSelector(state);

  if (itwShouldRenderNewItWalletSelector(state)) {
    return eidStatus !== "jwtExpired" && eidStatus !== "invalid";
  }

  if (itwIsL3UpgradeOfferedSelector(state)) {
    return !itwAreEidAndAnyCredentialExpiredSelector(state);
  }

  if (!isConnectedSelector(state)) {
    return eidStatus === "jwtExpiring";
  }

  return false;
};
