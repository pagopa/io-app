import { Errors } from "@pagopa/io-react-native-wallet";
import { differenceInCalendarDays } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getCredentialExpireDate } from "./itwClaimsUtils";
import { ItwCredentialStatus, StoredCredential } from "./itwTypesUtils";

type GetCredentialStatusOptions = {
  /**
   * Number of days before expiration required to mark a credential as "EXPIRING".
   */
  expiringDays?: number;
};

/**
 * Get the overall status of the credential, taking into account the status attestation,
 * the physical document's expiration date and the JWT's expiration date.
 * Overlapping statuses are handled according to a specific order (see `IO-WALLET-DR-0018`).
 *
 * @param credential the stored credential
 * @param options see {@link GetCredentialStatusOptions}
 * @returns ItwCredentialStatus
 */
export const getCredentialStatus = (
  credential: StoredCredential,
  options: GetCredentialStatusOptions = {}
): ItwCredentialStatus => {
  const { expiringDays = 14 } = options;
  const {
    jwt,
    parsedCredential,
    storedStatusAttestation: statusAttestation
  } = credential;
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
    statusAttestation?.credentialStatus === "invalid" &&
    statusAttestation.errorCode === "credential_expired";

  if (isIssuerAttestedExpired || documentExpireDays <= 0) {
    return "expired";
  }

  // Invalid must prevail over non-expired statuses
  if (statusAttestation?.credentialStatus === "invalid") {
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

  return "valid";
};

/**
 * Get the credential status and the error message corresponding to the status attestation error, if present.
 * The message is dynamic and extracted from the issuer configuration.
 */
export const getCredentialStatusObject = (credential: StoredCredential) => {
  const { storedStatusAttestation, issuerConf, credentialType } = credential;

  const errorCode =
    storedStatusAttestation?.credentialStatus === "invalid"
      ? storedStatusAttestation.errorCode
      : undefined;

  return {
    status: getCredentialStatus(credential),
    message: errorCode
      ? Errors.extractErrorMessageFromIssuerConf(errorCode, {
          issuerConf,
          credentialType
        })
      : undefined
  };
};
