import { createSelector } from "reselect";
import { itwIsWalletEmptySelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { itwIsFeedbackBannerHiddenSelector } from "./preferences";
/**
 * Returns if the feedback banner should be visible. The banner is visible if:
 * - The Wallet has valid Wallet Instance and a valid eID
 * - The Wallet has at least one credential
 * - The user did not close the banner
 */
export const itwShouldRenderFeedbackBanner = createSelector(
  itwLifecycleIsValidSelector,
  itwIsWalletEmptySelector,
  itwIsFeedbackBannerHiddenSelector,
  (isItwValid, isWalletEmpty, isBannerHidden) =>
    isItwValid && !isWalletEmpty && !isBannerHidden
);
