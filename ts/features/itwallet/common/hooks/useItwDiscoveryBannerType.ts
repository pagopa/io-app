import { useEffect, useState } from "react";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwIsWalletInstanceRemotelyActiveSelector } from "../store/selectors/preferences.ts";

type BannerType = "onboarding" | "reactivating";

/**
 * Hook to determine the type of the ITW discovery banner to display based on the wallet's state
 * @returns the type of the banner to display
 */
export const useItwDiscoveryBannerType = () => {
  const [bannerType, setBannerType] = useState<BannerType | undefined>(
    undefined
  );
  const isWalletRemotelyActive = useIOSelector(
    itwIsWalletInstanceRemotelyActiveSelector
  );

  useEffect(() => {
    pipe(
      O.fromNullable(isWalletRemotelyActive),
      O.map(isActive => (isActive ? "reactivating" : "onboarding")),
      O.map(setBannerType)
    );
  }, [isWalletRemotelyActive]);

  return bannerType;
};
