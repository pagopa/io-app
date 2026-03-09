import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../common/utils/itwTypesUtils";

const EXCLUDED_CREDENTIAL_STATUSES: ReadonlyArray<ItwCredentialStatus> = [
  "expired",
  "expiring",
  "invalid",
  "unknown"
];

/**
 * Determines which credential status should be displayed in the UI
 * based on the current eID status and offline conditions.
 *
 * Logic summary:
 * - Excluded statuses ("expired", "expiring", "invalid", "unknown") are never overridden.
 * - Offline:
 *   - Show "jwtExpired" only if eID is valid.
 *   - Otherwise, show "valid".
 * - Online:
 *   - Show actual credential status if eID is valid.
 *   - Otherwise, show "valid".
 *
 * @param credentialStatus The actual credential status
 * @param eidStatus The current eID status
 * @param isOffline Whether the app is operating offline
 * @returns {ItwCredentialStatus}The display status for the credential
 */
export const getItwDisplayCredentialStatus = (
  credentialStatus: ItwCredentialStatus,
  eidStatus: ItwJwtCredentialStatus | undefined,
  isOffline: boolean
): ItwCredentialStatus => {
  // Excluded statuses are never overridden
  if (EXCLUDED_CREDENTIAL_STATUSES.includes(credentialStatus)) {
    return credentialStatus;
  }

  const isEidValid = eidStatus === "valid";

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
