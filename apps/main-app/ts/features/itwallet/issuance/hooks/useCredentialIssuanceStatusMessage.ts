import { useIOSelector } from "../../../../store/hooks";
import { useIoWallet } from "../../common/hooks/useIoWallet";
import {
  CredentialStatusMessage,
  getCredentialStatusMessageFromCatalog,
  getCredentialStatusMessageFromIssuerConf
} from "../../common/utils/itwCredentialStatusUtils";
import { statusAssertionFailure } from "../../common/utils/itwFailureUtils";
import { IssuerConfiguration } from "../../common/utils/itwTypesUtils";
import {
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialsCatalogueByTypesSelector
} from "../../credentialsCatalogue/store/selectors";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../../machine/credential/failure";

/**
 * Hook to map a status failure obtained during the issuance flow to the dedicated Credential Issuer's message.
 * The message can be extracted from two sources:
 * - The Digital Credentials Catalog and its translations, for newer credentials that use status lists;
 * - The Entity Configuration, for legacy credentials that use status assertions.
 *
 * @param failure The issuance failure to get the error message for
 * @param issuerConf The Entity Configuration (optional)
 * @returns The error title and description and the extracted error code
 */
export const useCredentialIssuanceStatusMessage = (
  failure: CredentialIssuanceFailure,
  issuerConf?: IssuerConfiguration
): {
  errorCode: string | undefined;
  message: CredentialStatusMessage | undefined;
} => {
  const credentialsCatalog = useIOSelector(
    itwCredentialsCatalogueByTypesSelector
  );
  const catalogTranslations = useIOSelector(
    itwCatalogueTranslationsByLocaleSelector
  );
  const ioWallet = useIoWallet();

  if (failure.type === CredentialIssuanceFailureType.INVALID_STATUS_BY_TSL) {
    const { credentialType = "" } = failure.reason?.metadata ?? {};

    const message = getCredentialStatusMessageFromCatalog({
      ioWallet,
      rawStatus: failure.reason?.rawStatus,
      catalogMetadata: credentialsCatalog?.[credentialType],
      catalogTranslations
    });
    return { message, errorCode: failure.reason?.rawStatus };
  }

  if (
    failure.type === CredentialIssuanceFailureType.INVALID_STATUS_BY_ASSERTION
  ) {
    const { credentialId } = failure.reason?.metadata ?? {};

    const parsed = statusAssertionFailure.safeParse(failure.reason?.reason);
    const errorCode = parsed.success ? parsed.data.error : undefined;
    const message = getCredentialStatusMessageFromIssuerConf({
      errorCode,
      issuerConf,
      credentialId
    });
    return { message, errorCode };
  }

  return { message: undefined, errorCode: undefined };
};
