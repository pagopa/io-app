import { useIOSelector } from "../../../../store/hooks.ts";
import { itwIsRemotelyActiveSelector } from "../../walletInstance/store/selectors";

export type DiscoveryBannerType = "onboarding" | "reactivating";

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
  const isRemotelyActive = useIOSelector(itwIsRemotelyActiveSelector);

  // While the value is still undefined, no banner is shown
  if (isRemotelyActive === undefined) {
    return undefined;
  }

  return isRemotelyActive ? "reactivating" : "onboarding";
};
