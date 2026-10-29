import { getCredentialExpireDays } from "../../../common/utils/itwClaimsUtils";
import { DEFAULT_EXPIRING_DAYS } from "../../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  ItwCredentialStatus,
  ItwEidStatus
} from "../../../common/utils/itwTypesUtils";

const EXCLUDED_CREDENTIAL_STATUSES: ReadonlyArray<ItwCredentialStatus> = [
  "expired",
  "expiring",
  "invalid",
  "unknown"
];

/**
 * Determines which credential status should be displayed in the UI based on the
 * current eID status and offline conditions.
 *
 * Logic summary: - Excluded statuses ("expired", "expiring", "invalid",
 * "unknown") are never overridden. - Expiring eID + online → the eID keeps its
 * own status, every other credential is masked. - Expired eID + expired
 * credential → display as "invalid" (both show "NON VALIDO"). - Expired eID
 * alone → keep credential's actual status (only PID shows "NON VALIDO"). -
 * Offline: - Show "jwtExpired" only if eID is valid. - Otherwise, show
 * "valid".
 *
 * - Non-PID digital expiration warnings are hidden, preserving physical
 *   expiration.
 * - Online + valid eID → show actual credential status.
 *
 * @param credentialStatus The actual credential status
 * @param eidStatus The current eID status
 * @param isOffline Whether the app is operating offline
 * @param isEid Whether the status belongs to the eID itself
 * @param credential The credential used to preserve physical expiration and
 *   unknown status
 * @returns {ItwCredentialStatus} The status to display in the UI
 */
export const getItwDisplayCredentialStatus = (
  credentialStatus: ItwCredentialStatus,
  eidStatus: ItwEidStatus | undefined,
  isOffline: boolean,
  isEid: boolean,
  credential?: CredentialMetadata
): ItwCredentialStatus => {
  // Only the PID requires advance digital renewal; the other credentials
  // renew transparently. Preserve any physical expiration or unknown status.
  if (!isEid && credentialStatus === "jwtExpiring") {
    const documentExpireDays = credential
      ? getCredentialExpireDays(credential.parsedCredential)
      : undefined;
    if (
      documentExpireDays !== undefined &&
      documentExpireDays <= DEFAULT_EXPIRING_DAYS
    ) {
      return "expiring";
    }
    return credential?.validity?.status === "unknown" ? "unknown" : "valid";
  }

  // Excluded statuses are never overridden
  if (EXCLUDED_CREDENTIAL_STATUSES.includes(credentialStatus)) {
    return credentialStatus;
  }

  // The eID shares its status with the PID, so the "eID not valid → show as valid"
  // rule below would make it mask its own expiring state. Keep it while online,
  // where the eID lifecycle alert explains the required action; offline that alert
  // is hidden (see itwShouldHideEidLifecycleAlert), so the tag must be hidden too.
  if (isEid && credentialStatus === "jwtExpiring" && !isOffline) {
    return credentialStatus;
  }

  const isEidValid = eidStatus === "valid";

  // Expired eid + expired credential → display as invalid (both NON VALIDO)
  // Expired eid alone → keep credential's actual status (badge/border only shown on PID)
  if (eidStatus === "jwtExpired") {
    return credentialStatus === "jwtExpired" ? "invalid" : credentialStatus;
  }

  // Offline: preserve only jwtExpired if eid is valid
  if (isOffline && isEidValid && credentialStatus === "jwtExpired") {
    return credentialStatus;
  }

  // Offline or invalid eid → treat as "valid"
  if (isOffline || !isEidValid) {
    return "valid";
  }

  // Default: eid valid and online → keep real status
  return credentialStatus;
};

/**
 * Returns whether the stored status assertion reports a suspended driving
 * licence, a case with dedicated static copy that must not fall back to the
 * issuer-provided dynamic error (Documenti su IO only).
 */
export const isMdlSuspendedIssuerError = ({
  credentialType,
  validity
}: CredentialMetadata) => {
  if (credentialType !== CredentialType.DRIVING_LICENSE) {
    return false;
  }
  return (
    validity?.type === "status_assertion" &&
    validity.status === "invalid" &&
    validity?.errorCode === "credential_suspended"
  );
};

export const shouldShowMdlUpdateDigitalCredential = (
  credential: CredentialMetadata,
  status?: ItwCredentialStatus
) => {
  if (credential.credentialType !== CredentialType.DRIVING_LICENSE) {
    return false;
  }

  if (status === "expired") {
    return true;
  }

  // Legacy status assertion
  if (credential.validity?.type === "status_assertion") {
    return (
      status === "invalid" &&
      credential.validity.status === "invalid" &&
      credential.validity.errorCode === "credential_invalid"
    );
  }

  // Status list
  return status === "invalid";
};
