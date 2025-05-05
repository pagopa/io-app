import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { itwIsWalletInstanceRemotelyActiveSelector } from "../store/selectors/preferences";
import { useIOSelector } from "../../../../store/hooks.ts";
import { isItwOfflineAccessEnabledSelector } from "../../../../store/reducers/persistedPreferences.ts";

// TODO: Remove onboardingWithOffline when the feature is fully released [SIW-2330]
type DiscoveryBannerType =
  | "onboarding"
  | "onboardingWithOffline"
  | "reactivating";

/**
 * Hook to determine the type of the ITW discovery banner to display based on the wallet's state.
 * Returns "reactivating" when there's an active wallet instance that can be reactivated,
 * otherwise returns "onboarding".
 *
 * @returns the type of the banner to display
 */
export const useItwDiscoveryBannerType = ():
  | DiscoveryBannerType
  | undefined => {
  // Get the wallet instance status from Redux
  const isWalletInstanceRemotelyActive = useIOSelector(
    itwIsWalletInstanceRemotelyActiveSelector
  );

  const isOfflineAccessEnabled = useIOSelector(
    isItwOfflineAccessEnabledSelector
  );

  // TODO: Remove onboardingWithOffline when the feature is fully released [SIW-2330]
  return pipe(
    O.fromNullable(isWalletInstanceRemotelyActive),
    O.fold(
      // If the value is still undefined, do nothing
      () => undefined,
      // Otherwise, set the banner type based on the definitive value
      isActive =>
        isActive
          ? "reactivating"
          : isOfflineAccessEnabled
          ? "onboardingWithOffline"
          : "onboarding"
    )
  );
};
