import { useMemo } from "react";
import { isItwCredential } from "../utils/itwCredentialUtils";
import { StoredCredential } from "../utils/itwTypesUtils";

/**
 * Simple hook that returns whether a given credential belongs to IT-Wallet.
 *
 * The hook is optimized to skip the check if the credential has not changed.
 *
 * @param credential The stored credential
 * @returns Boolean indicating whether the credential was obtained with L3
 */
export const useIsItwCredential = (credential: StoredCredential) =>
  useMemo(
    () => isItwCredential(credential.credential),
    [credential.credential]
  );
