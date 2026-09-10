import { useIOSelector } from "../../../../store/hooks";
import {
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialsCatalogueByTypesSelector
} from "../../credentialsCatalogue/store/selectors";
import {
  getAuthSource,
  getForcedItwAuthSource,
  getItwAuthSource
} from "../utils/itwMetadataUtils";
import { CredentialMetadata } from "../utils/itwTypesUtils";

/**
 * Custom hook to retrieve the display name of the authentication source for a
 * given credential type.
 *
 * @param credentialType - the credential type to resolve the auth source for
 * @param credential - optional credential metadata used to resolve the auth source
 * from the issuer configuration when the credential is not part of the catalogue
 * (legacy "Documenti su IO" credentials).
 */
export const useItwAuthSourceName = (
  credentialType: string,
  credential?: CredentialMetadata
): string | undefined => {
  const credentialsCatalogue = useIOSelector(
    itwCredentialsCatalogueByTypesSelector
  );
  const translationsByLocale = useIOSelector(
    itwCatalogueTranslationsByLocaleSelector
  );
  const forcedAuthSource = getForcedItwAuthSource(credentialType);
  if (forcedAuthSource) {
    return forcedAuthSource;
  }

  const catalogueMeta = credentialsCatalogue?.[credentialType];
  if (catalogueMeta) {
    return getItwAuthSource(catalogueMeta, translationsByLocale);
  }

  return credential ? getAuthSource(credential) : undefined;
};
