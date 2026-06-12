import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwIsRemotelyActiveSelector } from "../../walletInstance/store/selectors";

export type DiscoveryBannerType = "onboarding" | "reactivating";

/**
 * Hook to determine the type of the ITW discovery banner to display based on
 * the wallet's state. Returns "reactivating" when there's an active wallet
 * instance that can be reactivated, otherwise returns "onboarding".
 *
 * @returns The type of the banner to display
 */
export const useItwDiscoveryBannerType = ():
  | DiscoveryBannerType
  | undefined => {
  // Get the wallet instance status from Redux
  const isRemotelyActive = useIOSelector(itwIsRemotelyActiveSelector);

  return pipe(
    O.fromNullable(isRemotelyActive),
    O.fold(
      // If the value is still undefined, do nothing
      () => undefined,
      // Otherwise, set the banner type based on the definitive value
      isActive => (isActive ? "reactivating" : "onboarding")
    )
  );
};
