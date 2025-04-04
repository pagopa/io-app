type DiscoveryBannerType = "onboarding" | "reactivating";

/**
 * Hook to determine the type of the ITW discovery banner to display based on the wallet's state
 * @returns the type of the banner to display
 */
export const useItwDiscoveryBannerType = (): DiscoveryBannerType =>
  // FIXME: (SIW-2048) we need to return the correct banner type based on the wallet's remote state
  "onboarding";
