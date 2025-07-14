import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector,
  itwIsWalletEmptySelector
} from "../../../credentials/store/selectors";
import {
  itwLifecycleIsOperationalOrValid,
  itwLifecycleIsValidSelector
} from "../../../lifecycle/store/selectors";
import { itwIsWalletInstanceStatusFailureSelector } from "../../../walletInstance/store/selectors";
import { isItwCredential } from "../../utils/itwCredentialUtils";
import {
  ItwJwtCredentialStatus,
  StoredCredential
} from "../../utils/itwTypesUtils";
import { CredentialType } from "../../utils/itwMocksUtils";
import {
  itwIsDiscoveryBannerHiddenSelector,
  itwIsFeedbackBannerHiddenSelector,
  itwIsL3EnabledSelector,
  itwIsOfflineBannerHiddenSelector,
  itwIsWalletUpgradeMDLDetailsBannerHiddenSelector
} from "./preferences";
import {
  isItwEnabledSelector,
  isItwFeedbackBannerEnabledSelector
} from "./remoteConfig";

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
 * Returns if the feedback banner should be visible. The banner is visible if:
 * - The user has online access (not available in the mini-app)
 * - The banner is enabled remotely
 * - The Wallet has valid Wallet Instance and a valid eID
 * - The Wallet has at least one credential
 * - The user did not close the banner
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderFeedbackBannerSelector = (state: GlobalState) =>
  !offlineAccessReasonSelector(state) &&
  isItwFeedbackBannerEnabledSelector(state) &&
  itwLifecycleIsValidSelector(state) &&
  !itwIsWalletEmptySelector(state) &&
  !itwIsFeedbackBannerHiddenSelector(state);

/**
 * Returns if the wallet ready banner should be visible. The banner is visible if:
 * - The user has online access (not available in the mini-app)
 * - The Wallet has valid Wallet Instance with a known status, and a valid eID
 * - The Wallet Instance is not in a failure status
 * - The eID is not expired
 * - The Wallet is empty
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderWalletReadyBannerSelector = (state: GlobalState) =>
  !offlineAccessReasonSelector(state) &&
  itwLifecycleIsValidSelector(state) &&
  !itwIsWalletInstanceStatusFailureSelector(state) &&
  itwCredentialsEidStatusSelector(state) !== "jwtExpired" &&
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
 * Returns if the offline banner should be visible. The banner is visible if:
 * - The user has online access (not available in the mini-app)
 * - The Wallet has a valid Wallet Instance
 * - The user did not close the banner
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderOfflineBannerSelector = (state: GlobalState) =>
  !offlineAccessReasonSelector(state) &&
  itwLifecycleIsValidSelector(state) &&
  !itwIsOfflineBannerHiddenSelector(state);

const isItwCredentialSelector = (state: GlobalState) =>
  pipe(
    itwCredentialsEidSelector(state),
    O.map(eid => isItwCredential(eid.credential)),
    O.getOrElse(() => false)
  );

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
  !isItwCredentialSelector(state);

/**
 * Returns whether the new IT-Wallet variant should be rendered.
 * - The IT Wallet feature flag is enabled
 * - The wallet is not offline
 * - The L3 feature flag is enabled
 * - Is ITW Credential
 */
export const itwShouldRenderNewITWalletSelector = (state: GlobalState) =>
  isItwEnabledSelector(state) &&
  !offlineAccessReasonSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  isItwCredentialSelector(state);

/**
 * Factory function that creates a selector to determine if any banners
 * should be displayed above the Wallet component.
 *
 * It checks three conditions:
 * 1. If the Wallet Ready banner should be rendered.
 * 2. If the Offline banner should be rendered.
 * 3. If the current ITW credential status is included in
 *    the specified list of `lifecycleStatus` values.
 */
export const makeItwHasActiveBannersAboveWalletSelector =
  (lifecycleStatus: Array<ItwJwtCredentialStatus>) => (state: GlobalState) => {
    const shouldDisplayStatus = pipe(
      O.fromNullable(itwCredentialsEidStatusSelector(state)),
      O.fold(
        () => false,
        status => lifecycleStatus.includes(status)
      )
    );

    return (
      itwShouldRenderWalletReadyBannerSelector(state) ||
      itwShouldRenderOfflineBannerSelector(state) ||
      shouldDisplayStatus
    );
  };

/**
 * Returns whether the IT-Wallet upgrade banner in MDL details should be rendered.
 * - The IT Wallet feature flag is enabled
 * - The wallet is not offline
 * - The L3 feature flag is enabled
 * - Isn't ITW Credential
 * - The user did not close the banner
 */
export const itwShouldRenderWalletUpgradeMDLDetailsBannerSelector = (
  state: GlobalState,
  credential: StoredCredential
): boolean =>
  isItwEnabledSelector(state) &&
  !offlineAccessReasonSelector(state) &&
  itwIsL3EnabledSelector(state) &&
  !isItwCredential(credential.credential) &&
  !itwIsWalletUpgradeMDLDetailsBannerHiddenSelector(state);
