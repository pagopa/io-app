import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../common/utils/itwTypesUtils";

/**
 * Determines which credential status should be displayed in the UI
 * based on the current eID status and offline conditions.
 *
 * Behavior summary:
 * - "expired", "expiring", "invalid", and "unknown" statuses are never overridden.
 * - In offline mode:
 *   - If the eID is "valid" and the credential is "jwtExpired", keep the real status.
 *   - Otherwise, treat all non-excluded credentials as "valid".
 * - When the eID is not "valid", non-excluded credentials are displayed as "valid"
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
  const excludedCredentialStatuses: ReadonlyArray<ItwCredentialStatus> = [
    "expired",
    "expiring",
    "invalid",
    "unknown"
  ];
  const isCredentialExcluded =
    excludedCredentialStatuses.includes(credentialStatus);

  /** Offline logic:
   * -  eID valid + credential jwtExpired → show actual status
   * -  not excluded → treat as valid
   */
  if (isOffline) {
    if (eidStatus === "valid" && credentialStatus === "jwtExpired") {
      return credentialStatus;
    }
    if (!isCredentialExcluded) {
      return "valid";
    }
  }

  // When eID is valid or the credential is explicitly excluded → keep actual status
  if (eidStatus === "valid" || isCredentialExcluded) {
    return credentialStatus;
  }

  return "valid";
};
