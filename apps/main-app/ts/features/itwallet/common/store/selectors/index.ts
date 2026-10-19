import { GlobalState } from "../../../../../store/reducers/types";
import { isConnectedSelector } from "../../../../connectivity/store/selectors";
import { OfflineAccessReasonEnum } from "../../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import {
  itwCredentialsEidIssuedAtSelector,
  itwCredentialsEidStatusSelector,
  itwIsWalletEmptySelector
} from "../../../credentials/store/selectors";
import {
  isItWalletAvailable,
  isWalletActive,
  ItwLifecycleState,
  itwLifecycleStateSelector
} from "../../../lifecycle/store/selectors";
import { hasPresentableCredentialsSelector } from "../../../presentation/proximity/store/selectors/credentials";
import {
  itwIsRemotelyActiveSelector,
  itwIsWalletInstanceStatusFailureSelector
} from "../../../walletInstance/store/selectors";
import { isCredentialIssuedBeforePid } from "../../utils/itwCredentialUtils";
import {
  itwIsAgeVerificationUsageDetailsBannerVisibleSelector,
  itwIsBannerVisibleSelector,
  itwIsDiscoveryBannerVisibleSelector,
  itwIsWalletDiscoveryBannerVisibleSelector,
  itwIsWalletUpgradeMDLDetailsBannerVisibleSelector
} from "./banners";
import { itwCredentialUpgradeFailedSelector } from "./preferences";
import {
  isItwEnabledSelector,
  isItwProximityMinAppVersionSupportedSelector
} from "./remoteConfig";

/**
 * Returns whether the wallet can be shown. The remote IT Wallet feature flag
 * cannot be refreshed while the device is offline, so it is assumed enabled.
 */
export const itwIsWalletEnabledSelector = (state: GlobalState) =>
  isItwEnabledSelector(state) ||
  !isConnectedSelector(state) ||
  offlineAccessReasonSelector(state) === OfflineAccessReasonEnum.DEVICE_OFFLINE;

/**
 * Returns whether wallet banners can be rendered: the user has online access
 * (banners are not available in the mini-app) and the IT Wallet feature flag is
 * enabled.
 */
const itwAreBannersEnabledSelector = (state: GlobalState) =>
  offlineAccessReasonSelector(state) === undefined &&
  isItwEnabledSelector(state);

/**
 * Returns if the Documenti su IO discovery banner should be rendered: no wallet
 * is active and the user cannot activate IT-Wallet.
 */
export const isItwDiscoveryBannerRenderableSelector = (state: GlobalState) =>
  itwAreBannersEnabledSelector(state) &&
  itwLifecycleStateSelector(state) === ItwLifecycleState.INACTIVE;

/**
 * Returns the renderable state of the discovery banner with the persisted
 * user's preference: after being closed by the user it should stay hidden for 6
 * months.
 */
export const isItwPersistedDiscoveryBannerRenderableSelector = (
  state: GlobalState
) =>
  itwIsDiscoveryBannerVisibleSelector(state) &&
  isItwDiscoveryBannerRenderableSelector(state);

/**
 * Returns if the wallet ready banner should be visible. The banner is visible
 * if:
 *
 * - The user has online access (not available in the mini-app)
 * - The Wallet is active
 * - The Wallet Instance is not in a failure status
 * - The eID is not expired or expiring
 * - The Wallet is empty
 *
 * @param state The application global state
 * @returns True if the banner should be visible, false otherwise
 */
export const itwShouldRenderWalletReadyBannerSelector = (state: GlobalState) =>
  offlineAccessReasonSelector(state) === undefined &&
  isWalletActive(itwLifecycleStateSelector(state)) &&
  !itwIsWalletInstanceStatusFailureSelector(state) &&
  itwCredentialsEidStatusSelector(state) !== "jwtExpired" &&
  itwCredentialsEidStatusSelector(state) !== "jwtExpiring" &&
  itwIsWalletEmptySelector(state);

/**
 * Returns if the wallet is available for offline access: the wallet is active
 * and contains at least one credential.
 */
export const itwOfflineAccessAvailableSelector = (state: GlobalState) =>
  isWalletActive(itwLifecycleStateSelector(state)) &&
  !itwIsWalletEmptySelector(state);

/**
 * Returns if the L3 upgrade banner should be rendered: the user can activate
 * IT-Wallet but has not done it yet.
 */
export const itwShouldRenderL3UpgradeBannerSelector = (state: GlobalState) => {
  const lifecycle = itwLifecycleStateSelector(state);
  return (
    itwAreBannersEnabledSelector(state) &&
    isItWalletAvailable(lifecycle) &&
    lifecycle !== ItwLifecycleState.IT_WALLET
  );
};

/** Returns whether a credential should be upgraded in IT Wallet. */
export const itwShouldUpgradeCredentialSelector =
  (credentialType: string, issuedAt?: string) => (state: GlobalState) => {
    const isItwPid =
      itwLifecycleStateSelector(state) === ItwLifecycleState.IT_WALLET;
    const pidIssuedAt = itwCredentialsEidIssuedAtSelector(state);
    const upgradeFailures = itwCredentialUpgradeFailedSelector(state);

    const hasUpgradeFailed = upgradeFailures.includes(credentialType);
    const isIssuedBeforePid =
      isItwPid && isCredentialIssuedBeforePid(issuedAt, pidIssuedAt);

    return isIssuedBeforePid || hasUpgradeFailed;
  };

/**
 * Returns whether the new IT-Wallet variant should be rendered: the wallet is
 * enabled and IT-Wallet is active.
 */
export const itwShouldRenderNewItWalletSelector = (state: GlobalState) =>
  itwIsWalletEnabledSelector(state) &&
  itwLifecycleStateSelector(state) === ItwLifecycleState.IT_WALLET;

/**
 * Returns whether the IT-Wallet upgrade banner in MDL details should be
 * rendered: the L3 upgrade banner is rendered and the user did not close it.
 */
export const itwShouldRenderWalletUpgradeMDLDetailsBannerSelector = (
  state: GlobalState
): boolean =>
  itwShouldRenderL3UpgradeBannerSelector(state) &&
  itwIsWalletUpgradeMDLDetailsBannerVisibleSelector(state);

/**
 * Returns whether the Age Verification usage banner in credential details
 * should be rendered.
 *
 * - The user did not close the banner
 */
export const itwShouldRenderAgeVerificationUsageDetailsBannerSelector = (
  state: GlobalState
): boolean => itwIsAgeVerificationUsageDetailsBannerVisibleSelector(state);

/**
 * Returns whether the eID lifecycle alert should be hidden in wallet. When the
 * ITW upgrade banner is displayed, the eID lifecycle alert is hidden so that
 * the user does not need to perform eID reissuance. The alert is hidden if:
 *
 * - The new IT Wallet design is being rendered (unless the eID is expired)
 * - The L3 upgrade banner is being displayed (unless the eID is expired)
 * - The eID is expiring and the device is offline
 */
export const itwShouldHideEidLifecycleAlert = (state: GlobalState): boolean => {
  if (itwCredentialsEidStatusSelector(state) === "jwtExpired") {
    return false;
  }
  return (
    itwShouldRenderNewItWalletSelector(state) ||
    itwShouldRenderL3UpgradeBannerSelector(state) ||
    (itwCredentialsEidStatusSelector(state) === "jwtExpiring" &&
      !isConnectedSelector(state))
  );
};

/**
 * Returns whether the new IT-Wallet activation banner should be rendered: no
 * wallet is active and the user can activate IT-Wallet.
 */
export const itwShouldRenderDiscoveryBannerSelector = (state: GlobalState) =>
  itwAreBannersEnabledSelector(state) &&
  itwLifecycleStateSelector(state) === ItwLifecycleState.IT_WALLET_ELIGIBLE;

/**
 * Returns whether the new IT-Wallet activation banner in the messages inbox
 * screen should be rendered
 */
export const itwShouldRenderInboxDiscoveryBannerSelector = (
  state: GlobalState
) => {
  if (itwIsRemotelyActiveSelector(state) === undefined) {
    return false;
  }
  return (
    itwShouldRenderDiscoveryBannerSelector(state) &&
    itwIsBannerVisibleSelector("discovery_messages_inbox")(state) &&
    !itwIsRemotelyActiveSelector(state)
  );
};

/**
 * Returns whether the new IT-Wallet activation banner in the messages inbox
 * screen should be rendered
 */
export const itwShouldRenderWalletDiscoveryBannerSelector = (
  state: GlobalState
) =>
  itwShouldRenderDiscoveryBannerSelector(state) &&
  itwIsBannerVisibleSelector("discovery_wallet")(state);

/**
 * Returns whether the new IT-Wallet upgrade banner should be rendered:
 * Documenti su IO is active, the user can upgrade to IT-Wallet and did not
 * dismiss the banner.
 */
export const itwShouldRenderUpgradeBannerSelector = (state: GlobalState) =>
  itwAreBannersEnabledSelector(state) &&
  itwLifecycleStateSelector(state) === ItwLifecycleState.DOC_IO_UPGRADABLE &&
  itwIsWalletDiscoveryBannerVisibleSelector(state);

/**
 * Returns whether the restricted Documenti su IO banner should be rendered to a
 * user with no active wallet whose device does not support NFC.
 */
export const itwShouldRenderL2EngagementBannerForInactiveWalletSelector = (
  state: GlobalState
) =>
  itwAreBannersEnabledSelector(state) &&
  itwLifecycleStateSelector(state) === ItwLifecycleState.IT_WALLET_UNSUPPORTED;

/**
 * Returns whether the restricted Documenti su IO banner should be rendered to a
 * user who activated Documenti su IO as a fallback.
 */
export const itwShouldRenderL2EngagementBannerSelector = (state: GlobalState) =>
  itwAreBannersEnabledSelector(state) &&
  itwLifecycleStateSelector(state) === ItwLifecycleState.DOC_IO_FALLBACK;

/**
 * Returns whether the IT Wallet proximity presentation feature is enabled: the
 * new IT-Wallet must be rendered and the app version must meet the proximity
 * minimum. The wallet must have at least one presentable credential.
 */
export const isItwProximityEnabledSelector = (state: GlobalState) =>
  itwShouldRenderNewItWalletSelector(state) &&
  isItwProximityMinAppVersionSupportedSelector(state) &&
  hasPresentableCredentialsSelector(state);
