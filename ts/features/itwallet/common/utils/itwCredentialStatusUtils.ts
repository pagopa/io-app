import { Errors } from "@pagopa/io-react-native-wallet";
import { differenceInCalendarDays } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getCredentialExpireDate } from "./itwClaimsUtils";
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
  const {
    jwt,
    parsedCredential,
    storedStatusAssertion: statusAssertion
  } = credential;
  // We could not determine the status of the credential.
  // This happens when the status assertion API call fails.
  if (statusAssertion?.credentialStatus === "unknown") {
    return "unknown";
  }

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
    statusAssertion?.credentialStatus === "invalid" &&
    statusAssertion.errorCode === "credential_expired";

  if (isIssuerAttestedExpired || documentExpireDays <= 0) {
    return "expired";
  }

  // Invalid must prevail over non-expired statuses
  if (statusAssertion?.credentialStatus === "invalid") {
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
 * Get the credential status and the error message corresponding to the status assertion error, if present.
 * The message is dynamic and extracted from the issuer configuration.
 */
export const getCredentialStatusObject = (credential: CredentialMetadata) => {
  const { storedStatusAssertion, issuerConf, credentialId } = credential;

  const errorCode =
    storedStatusAssertion?.credentialStatus === "invalid"
      ? storedStatusAssertion.errorCode
      : undefined;

  const message = pipe(
    O.fromNullable(errorCode),
    O.chain(code =>
      O.tryCatch(() =>
        Errors.extractErrorMessageFromIssuerConf(code, {
          issuerConf: issuerConf as IssuerConfiguration,
          credentialType: credentialId
        })
      )
    ),
    O.toUndefined
  );

  return {
    status: getCredentialStatus(credential),
    message
  };
};
