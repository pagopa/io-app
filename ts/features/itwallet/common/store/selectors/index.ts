import {
  isItwEnabledSelector,
  isItwFeedbackBannerEnabledSelector
} from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  itwCredentialsEidStatusSelector,
  itwIsWalletEmptySelector
} from "../../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { itwIsWalletInstanceStatusFailedSelector } from "../../../walletInstance/store/reducers";
import {
  itwIsFeedbackBannerHiddenSelector,
  itwIsDiscoveryBannerHiddenSelector
} from "./preferences";

/**
 * Returns if the discovery banner should be rendered. The banner is rendered if:
 * - The Wallet is not already activated and valid
 * - The IT Wallet feature flag is enabled
 * @param state the application global state
 * @returns true if the banner should be rendered, false otherwise
 */
export const isItwDiscoveryBannerRenderableSelector = (state: GlobalState) =>
  !itwLifecycleIsValidSelector(state) && isItwEnabledSelector(state);

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
  !itwIsWalletInstanceStatusFailedSelector(state) &&
  itwCredentialsEidStatusSelector(state) !== "jwtExpired" &&
  itwIsWalletEmptySelector(state);
