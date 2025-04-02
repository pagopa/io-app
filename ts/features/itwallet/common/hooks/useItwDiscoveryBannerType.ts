import { useIOSelector } from "../../../../store/hooks.ts";
import { itwIsWalletInstanceRemotelyActiveSelector } from "../store/selectors/preferences.ts";

type DiscoveryBannerType = "onboarding" | "reactivating";

/**
 * Hook to determine the type of the ITW discovery banner to display based on the wallet's state
 * @returns the type of the banner to display
 */
export const useItwDiscoveryBannerType = (): DiscoveryBannerType => {
  const isWalletRemotelyActive = useIOSelector(
    itwIsWalletInstanceRemotelyActiveSelector
  );

  return isWalletRemotelyActive ? "reactivating" : "onboarding";
};
