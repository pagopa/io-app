import {
  CredentialMetadata,
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

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
 * - Expired eID + expired credential → display as "invalid" (both show "NON VALIDO").
 * - Expired eID alone → keep credential's actual status (only PID shows "NON VALIDO").
 * - Offline:
 *   - Show "jwtExpired" only if eID is valid.
 *   - Otherwise, show "valid".
 * - Online + valid eID → show actual credential status.
 *
 * @param credentialStatus The actual credential status
 * @param eidStatus The current eID status
 * @param isOffline Whether the app is operating offline
 * @returns {ItwCredentialStatus} The status to display in the UI
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

  return (
    status === "invalid" &&
    credential.storedStatusAssertion?.credentialStatus === "invalid" &&
    credential.storedStatusAssertion.errorCode === "credential_invalid"
  );
};
