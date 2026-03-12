import { addDays, subDays } from "date-fns";
import { WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../common/utils/itwTypesUtils";

const EXPIRING_DAYS = 15;
const SAFE_JWT_DAYS = 365;

/**
 * Returns a copy of the given credential modified so that
 * getCredentialStatus will naturally return the requested status.
 *
 * This is intentionally kept in the playground module and never
 * imported by production code.
 */
export const applyStatusToCredential = (
  credential: StoredCredential,
  status: ItwCredentialStatus
): StoredCredential => {
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
      const expiringDate = addDays(now, EXPIRING_DAYS)
        .toISOString()
        .split("T")[0];
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
            ? { ...existingExpiry, value: expiringDate }
            : { value: expiringDate }
        } as StoredCredential["parsedCredential"]
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
