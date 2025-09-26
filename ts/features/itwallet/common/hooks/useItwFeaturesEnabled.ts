import { useMemo } from "react";
import { isItwCredential } from "../utils/itwCredentialUtils";
import { StoredCredential } from "../utils/itwTypesUtils";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";

/**
 * Simple hook that returns whether a given credential uses IT-Wallet features
 * (for example the design and the proximity presentation).
 *
 * The hook is optimized to skip the check if the credential has not changed.
 *
 * @param credential The stored credential
 * @returns Boolean indicating whether the credential is compatible with IT-Wallet features
 */
export const useItwFeaturesEnabled = (credential: StoredCredential) => {
  const isItWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return useMemo(
    () => isItWalletValid && isItwCredential(credential),
    [isItWalletValid, credential]
  );
};
