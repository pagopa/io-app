import { useMemo } from "react";

import { useIOSelector } from "../../../../store/hooks";
import { useIoWallet } from "../../common/hooks/useIoWallet";
import {
  CredentialStatusMessage,
  getCredentialStatusMessageFromCatalog,
  getCredentialStatusMessageFromIssuerConf
} from "../../common/utils/itwCredentialStatusUtils";
import {
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialsCatalogueByTypesSelector
} from "../../credentialsCatalogue/store/selectors";
import { itwCredentialSelector } from "../store/selectors";

/**
 * Get the localized message corresponding to the status list/status assertion code, if present.
 * The message is dynamic and extracted either
 * - From the credentials catalog, for newer credentials that support status list, or
 * - From the issuer configuration, for legacy 1.0 credentials.
 *
 * Note: this hook exists mainly because of circular dependencies across IT-Wallet selectors,
 * that become a problem when this logic is moved to a selector.
 *
 * TODO: task SIW-4723 aims at improving the selectors structure.
 *
 * @param credentialType - The credential type.
 * @returns The localized message corresponding to the status list/status assertion code, if present.
 */
export const useCredentialStatusMessage = (
  credentialType: string
): CredentialStatusMessage | undefined => {
  const ioWallet = useIoWallet();

  const credential = useIOSelector(itwCredentialSelector(credentialType));
  const catalog = useIOSelector(itwCredentialsCatalogueByTypesSelector);
  const catalogTranslations = useIOSelector(
    itwCatalogueTranslationsByLocaleSelector
  );

  return useMemo(() => {
    if (!credential) {
      return undefined;
    }

    if (credential.validity?.type === "status_assertion") {
      const errorCode =
        credential.validity.status === "invalid"
          ? credential.validity.errorCode
          : undefined;
      return getCredentialStatusMessageFromIssuerConf({
        errorCode,
        issuerConf: credential.issuerConf,
        credentialId: credential.credentialId
      });
    }

    // The catalog might contain a message even for the valid status
    if (credential.validity?.status === "valid") {
      return undefined;
    }

    return getCredentialStatusMessageFromCatalog({
      ioWallet,
      rawStatus: credential.validity?.rawStatus,
      catalogMetadata: catalog?.[credentialType],
      catalogTranslations
    });
  }, [ioWallet, credential, catalog, credentialType, catalogTranslations]);
};
