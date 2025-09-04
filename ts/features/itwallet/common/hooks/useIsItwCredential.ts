import { useMemo } from "react";
import { isItwCredential } from "../utils/itwCredentialUtils";
import { StoredCredential } from "../utils/itwTypesUtils";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";

/**
 * Simple hook that returns whether a given credential belongs to IT-Wallet.
 *
 * The hook is optimized to skip the check if the credential has not changed.
 *
 * @param credential The stored credential
 * @returns Boolean indicating whether the credential was obtained with L3
 */
export const useIsItwCredential = (credential: StoredCredential) => {
  const isItWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return useMemo(
    () => isItWalletValid && isItwCredential(credential.credential),
    [isItWalletValid, credential.credential]
  );
};
