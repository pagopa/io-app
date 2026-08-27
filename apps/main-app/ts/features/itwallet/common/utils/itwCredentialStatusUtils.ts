import { Errors, IoWallet } from "@pagopa/io-react-native-wallet";
import { differenceInCalendarDays } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { getClaimsFullLocale, getCredentialExpireDate } from "./itwClaimsUtils";
import { DigitalCredentialMetadata } from "./itwCredentialsCatalogueUtils";
import {
  CredentialMetadata,
  IssuerConfiguration,
  ItwCredentialStatus
} from "./itwTypesUtils";

const DEFAULT_EXPIRING_DAYS = 30;

type GetCredentialStatusOptions = {
  /**
   * Number of days before expiration required to mark a credential as "EXPIRING".
   * @default 30
   */
  expiringDays?: number;
};

/**
 * Get the overall status of the credential, taking into account the status assertion,
 * the physical document's expiration date and the JWT's expiration date.
 * Overlapping statuses are handled according to a specific order (see `IO-WALLET-DR-0018`).
 *
 * @param credential the stored credential
 * @param options see {@link GetCredentialStatusOptions}
 * @returns ItwCredentialStatus
 */
export const getCredentialStatus = (
  credential: CredentialMetadata,
  options: GetCredentialStatusOptions = {}
): ItwCredentialStatus => {
  const { expiringDays = DEFAULT_EXPIRING_DAYS } = options;
  const { jwt, parsedCredential, validity } = credential;

  const now = Date.now();

  const jwtExpireDays = differenceInCalendarDays(jwt.expiration, now);

  // Not all credentials have an expiration date
  const documentExpireDays = pipe(
    getCredentialExpireDate(parsedCredential),
    O.fromNullable,
    O.map(expireDate => differenceInCalendarDays(expireDate, now)),
    O.getOrElse(() => NaN)
  );

  const isIssuerAttestedExpired =
    validity?.type === "status_assertion" &&
    validity?.status === "invalid" &&
    validity.errorCode === "credential_expired";

  if (isIssuerAttestedExpired || documentExpireDays <= 0) {
    return "expired";
  }

  // Invalid must prevail over non-expired statuses
  if (validity?.status === "invalid") {
    return "invalid";
  }

  if (jwtExpireDays <= 0) {
    return "jwtExpired";
  }

  const isSameDayExpiring =
    documentExpireDays === jwtExpireDays && documentExpireDays <= expiringDays;

  // When both credentials are expiring the digital one wins unless they expire the same day
  if (jwtExpireDays <= expiringDays && !isSameDayExpiring) {
    return "jwtExpiring";
  }

  if (documentExpireDays <= expiringDays) {
    return "expiring";
  }

  // We could not determine the status of the credential.
  // This happens when the status assertion API call fails.
  if (validity?.status === "unknown") {
    return "unknown";
  }

  return "valid";
};

export type CredentialStatusMessage = {
  description?: string;
  title?: string;
};

/**
 * Extract the status message from the catalog for the provided raw status.
 * This function is meant to be used for status list codes (e.g. `0x01`, `0x02`).
 * @param ioWallet - The current IoWallet instance
 * @param rawStatus - The raw status, e.g. `0x01`
 * @param catalogMetadata - The credential metadata from the catalog, used to map the code to a l10n string
 * @param catalogTranslations - The catalog translations to resolve the l10n string
 * @returns The message for the provided status code, if found
 */
export const getCredentialStatusMessageFromCatalog = ({
  ioWallet,
  rawStatus,
  catalogMetadata,
  catalogTranslations
}: {
  catalogMetadata?: DigitalCredentialMetadata;
  catalogTranslations?: Record<string, string>;
  ioWallet: IoWallet;
  rawStatus?: string;
}): CredentialStatusMessage | undefined => {
  if (!rawStatus || !catalogMetadata) {
    return undefined;
  }

  const l10nMessage = ioWallet.CredentialsCatalogue.getStatusL10nIds(
    rawStatus,
    catalogMetadata
  );

  return l10nMessage
    ? {
        title: catalogTranslations?.[l10nMessage.titleL10nId],
        description: catalogTranslations?.[l10nMessage.descriptionL10nId]
      }
    : undefined;
};

/**
 * Extract the status message from the Issuer's EC for the provided error code.
 * This function is meant to be used for status assertions codes.
 * @param errorCode - The raw error code, e.g. `credential_suspended`
 * @param issuerConf - The Issuer's Entity Configuration to extract the message from
 * @param credentialId - The credential ID the code belongs to
 * @returns The message for the provided error code, if found
 */
export const getCredentialStatusMessageFromIssuerConf = ({
  errorCode,
  credentialId,
  issuerConf
}: {
  credentialId?: string;
  errorCode?: string;
  issuerConf?: IssuerConfiguration;
}): CredentialStatusMessage | undefined => {
  if (!errorCode || !credentialId || !issuerConf) {
    return undefined;
  }

  try {
    const messagesByLocale = Errors.extractErrorMessageFromIssuerConf(
      errorCode,
      {
        issuerConf,
        credentialType: credentialId // Legacy mismatch: the param `credentialType` was not renamed
      }
    );
    return messagesByLocale?.[getClaimsFullLocale()];
  } catch {
    return undefined;
  }
};
