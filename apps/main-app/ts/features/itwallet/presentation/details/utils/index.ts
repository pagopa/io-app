import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../common/utils/itwTypesUtils";

/**
 * Statuses that always reflect the credential's own condition and must never be
 * masked by the eID status or by the offline mode. "jwtExpiring" belongs here
 * because it is derived from the locally stored JWT expiration: it stays accurate
 * without connectivity, and an eID that is itself expiring must not hide it —
 * the PID shares its status with the eID, so it would otherwise hide its own tag.
 */
const EXCLUDED_CREDENTIAL_STATUSES: ReadonlyArray<ItwCredentialStatus> = [
  "expired",
  "expiring",
  "invalid",
  "unknown",
  "jwtExpiring"
];

/**
 * Determines which credential status should be displayed in the UI
 * based on the current eID status and offline conditions.
 *
 * Logic summary:
 * - Excluded statuses (see {@link EXCLUDED_CREDENTIAL_STATUSES}) are never overridden.
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

/**
 * Returns whether the stored status list/assertion reports a suspended driving
 * licence, a case with dedicated static copy that must not fall back to the
 * issuer-provided dynamic error.
 */
export const isMdlSuspendedIssuerError = ({
  credentialType,
  validity
}: CredentialMetadata) => {
  if (credentialType !== CredentialType.DRIVING_LICENSE) {
    return false;
  }
  return (
    (validity?.type === "status_list" && validity.status === "suspended") ||
    (validity?.type === "status_assertion" &&
      validity.status === "invalid" &&
      validity?.errorCode === "credential_suspended")
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
      status == "invalid" &&
      credential.validity.status === "invalid" &&
      credential.validity.errorCode === "credential_invalid"
    );
  }

  // Status list
  return status === "invalid";
};
