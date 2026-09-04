import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { addDays, format, subDays } from "date-fns";

import { WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  CredentialValidity,
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../common/utils/itwTypesUtils";

const EXPIRING_DAYS = 15;
const SAFE_JWT_DAYS = 365;

const toSimpleDate = (date: Date) => format(date, "YYYY-MM-DD");

/**
 * Clears previous status mocks and makes both the digital and physical
 * expiration dates safely valid before applying the requested status.
 */
const normalizeCredentialAsValid = (
  credential: CredentialMetadata,
  now: Date
): CredentialMetadata => {
  const safeExpirationDate = addDays(now, SAFE_JWT_DAYS);
  const existingExpiry =
    credential.parsedCredential[WellKnownClaim.expiry_date];

  return {
    ...credential,
    validity: undefined,
    jwt: {
      ...credential.jwt,
      expiration: safeExpirationDate.toISOString()
    },
    parsedCredential: {
      ...credential.parsedCredential,
      ...(existingExpiry === undefined
        ? {}
        : {
            [WellKnownClaim.expiry_date]: {
              ...existingExpiry,
              value: toSimpleDate(safeExpirationDate)
            }
          })
    } as CredentialMetadata["parsedCredential"]
  };
};

/** Statuses available for the PID — only JWT-based, since the wallet card does not support status assertions on the eID. */
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
    "suspended",
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
 * Returns a copy of the given credential modified so that
 * getCredentialStatus will naturally return the requested status.
 *
 * This is intentionally kept in the playground module and never
 * imported by production code.
 */
export const applyStatusToCredential = (
  credential: CredentialMetadata,
  status: ItwCredentialStatus
): CredentialMetadata => {
  const now = new Date();
  const validCredential = normalizeCredentialAsValid(credential, now);

  const isTslSupported = getIoWallet(credential.spec_version as ItwVersion)
    .CredentialStatus.statusList.isSupported;

  switch (status) {
    // The credential expiry_date can be used for both status assertion-based and status list-based credentials
    case "expired": {
      const expiryDate = subDays(now, 1);
      const existingExpiry =
        validCredential.parsedCredential[WellKnownClaim.expiry_date];
      return {
        ...validCredential,
        parsedCredential: {
          ...validCredential.parsedCredential,
          [WellKnownClaim.expiry_date]: {
            name: existingExpiry?.name,
            value: toSimpleDate(expiryDate)
          }
        }
      };
    }

    case "expiring": {
      const expiringDate = addDays(now, EXPIRING_DAYS);
      const existingExpiry =
        validCredential.parsedCredential[WellKnownClaim.expiry_date];
      return {
        ...validCredential,
        parsedCredential: {
          ...validCredential.parsedCredential,
          [WellKnownClaim.expiry_date]: {
            name: existingExpiry?.name,
            value: toSimpleDate(expiringDate)
          }
        }
      };
    }

    case "invalid":
      return {
        ...validCredential,
        validity: isTslSupported
          ? {
              ...(validCredential.validity as CredentialValidity),
              type: "status_list",
              status: "invalid",
              rawStatus: "0x01"
            }
          : {
              type: "status_assertion",
              status: "invalid",
              errorCode: "credential_revoked"
            }
      };

    case "jwtExpired":
      return {
        ...validCredential,
        jwt: {
          ...validCredential.jwt,
          expiration: subDays(now, 1).toISOString()
        }
      };

    case "jwtExpiring":
      return {
        ...validCredential,
        jwt: {
          ...validCredential.jwt,
          expiration: addDays(now, EXPIRING_DAYS).toISOString()
        }
      };

    case "suspended":
      return {
        ...validCredential,
        validity: isTslSupported
          ? {
              ...(validCredential.validity as CredentialValidity),
              type: "status_list",
              status: "suspended",
              rawStatus: "0x02"
            }
          : {
              type: "status_assertion",
              status: "invalid",
              errorCode: "credential_suspended"
            }
      };

    case "unknown":
      return {
        ...validCredential,
        validity: isTslSupported
          ? {
              ...(validCredential.validity as CredentialValidity),
              type: "status_list",
              status: "unknown"
            }
          : {
              type: "status_assertion",
              status: "unknown"
            }
      };

    case "valid":
      return validCredential;
  }
};
