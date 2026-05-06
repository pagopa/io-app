import { useIOSelector } from "../../../../store/hooks";
import { itwCredentialNameResolverSelector } from "../../credentialsCatalogue/store/selectors";

/**
 * Returns the display name for a credential type, resolved from:
 * 1. Catalogue translations (IT-Wallet v1.3.3+, from Redux store)
 * 2. Catalogue static name (fallback when translations are unavailable)
 * 3. Hardcoded i18n string (final fallback for legacy / Documenti su IO)
 *
 * For array/loop use cases, use `itwCredentialNameResolverSelector` directly.
 */
export const useItwCredentialName = (
  credentialType: string | undefined,
  withDefault: string = ""
): string => {
  const resolver = useIOSelector(itwCredentialNameResolverSelector);
  return resolver(credentialType, withDefault);
};
