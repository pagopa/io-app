import { addDays, subDays } from "date-fns";
import { SimpleDate, WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus,
  CredentialMetadata
} from "../../common/utils/itwTypesUtils";

const EXPIRING_DAYS = 15;
const SAFE_JWT_DAYS = 365;

/**
 * Statuses available for the PID — only JWT-based, since the wallet card does
 * not support status assertions on the eID.
 */
export const PID_OVERRIDE_STATUSES: ReadonlyArray<ItwJwtCredentialStatus> = [
  "valid",
  "jwtExpiring",
  "jwtExpired"
];

/** Statuses available for regular credentials. */
export const CREDENTIAL_OVERRIDE_STATUSES: ReadonlyArray<ItwCredentialStatus> =
  [
    "valid",
    "invalid",
    "expiring",
    "expired",
    "jwtExpiring",
    "jwtExpired",
    "unknown"
  ];

export const getAvailableStatusOverrides = (
  credentialType: string
): ReadonlyArray<ItwCredentialStatus> =>
  credentialType === CredentialType.PID
    ? PID_OVERRIDE_STATUSES
    : CREDENTIAL_OVERRIDE_STATUSES;

/**
 * Returns a copy of the given credential modified so that getCredentialStatus
 * will naturally return the requested status.
 *
 * This is intentionally kept in the playground module and never imported by
 * production code.
 */
export const applyStatusToCredential = (
  credential: CredentialMetadata,
  status: ItwCredentialStatus
): CredentialMetadata => {
  const now = new Date();

  switch (status) {
    case "jwtExpired":
      return {
        ...credential,
        storedStatusAssertion: undefined,
        jwt: {
          ...credential.jwt,
          expiration: subDays(now, 1).toISOString()
        }
      };

    case "jwtExpiring":
      return {
        ...credential,
        storedStatusAssertion: undefined,
        jwt: {
          ...credential.jwt,
          expiration: addDays(now, EXPIRING_DAYS).toISOString()
        }
      };

    case "expired":
      return {
        ...credential,
        storedStatusAssertion: {
          credentialStatus: "invalid",
          errorCode: "credential_expired"
        }
      };

    case "expiring": {
      const expiringDate = addDays(now, EXPIRING_DAYS);
      const existingExpiry =
        credential.parsedCredential[WellKnownClaim.expiry_date];
      return {
        ...credential,
        storedStatusAssertion: undefined,
        // Ensure the JWT is well within validity so only the document triggers "expiring"
        jwt: {
          ...credential.jwt,
          expiration: addDays(now, SAFE_JWT_DAYS).toISOString()
        },
        parsedCredential: {
          ...credential.parsedCredential,
          [WellKnownClaim.expiry_date]: existingExpiry
            ? {
                ...existingExpiry,
                value: new SimpleDate(
                  expiringDate.getFullYear(),
                  expiringDate.getMonth(),
                  expiringDate.getDate()
                )
              }
            : {
                value: new SimpleDate(
                  expiringDate.getFullYear(),
                  expiringDate.getMonth(),
                  expiringDate.getDate()
                )
              }
        } as CredentialMetadata["parsedCredential"]
      };
    }

    case "invalid":
      return {
        ...credential,
        storedStatusAssertion: {
          credentialStatus: "invalid",
          errorCode: "credential_revoked"
        }
      };

    case "unknown":
      return {
        ...credential,
        storedStatusAssertion: { credentialStatus: "unknown" }
      };

    case "valid":
      return {
        ...credential,
        storedStatusAssertion: undefined,
        jwt: {
          ...credential.jwt,
          expiration: addDays(now, SAFE_JWT_DAYS).toISOString()
        }
      };
  }
};
