import { useIOSelector } from "../../../../store/hooks";
import {
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialsCatalogueByTypesSelector
} from "../../credentialsCatalogue/store/selectors";
import {
  getForcedItwAuthSource,
  getItwAuthSource
} from "../utils/itwMetadataUtils";

/**
 * Custom hook to retrieve the display name of the authentication source for a
 * given credential type.
 */
export const useItwAuthSourceName = (
  credentialType: string
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
  const authSource = catalogueMeta
    ? getItwAuthSource(catalogueMeta, translationsByLocale)
    : undefined;

  return authSource;
};
