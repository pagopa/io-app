import { isItwEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { isItwTrialActiveSelector } from "../../../../trialSystem/store/reducers";
import { itwIsWalletEmptySelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { itwIsFeedbackBannerHiddenSelector } from "./preferences";

/**
 * Returns if the discovery banner should be rendered. The banner is rendered if:
 * - The user's ITW trial subscription is ACTIVE
 * - The Wallet is not already activated and valid
 * - The IT Wallet feature flag is enabled
 * @param state the application global state
 * @returns true if the banner should be rendered, false otherwise
 */
export const isItwDiscoveryBannerRenderableSelector = (state: GlobalState) =>
  isItwTrialActiveSelector(state) &&
  !itwLifecycleIsValidSelector(state) &&
  isItwEnabledSelector(state);

/**
 * Returns if the feedback banner should be visible. The banner is visible if:
 * - The Wallet has valid Wallet Instance and a valid eID
 * - The Wallet has at least one credential
 * - The user did not close the banner
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderFeedbackBannerSelector = (state: GlobalState) =>
  itwLifecycleIsValidSelector(state) &&
  !itwIsWalletEmptySelector(state) &&
  !itwIsFeedbackBannerHiddenSelector(state);
