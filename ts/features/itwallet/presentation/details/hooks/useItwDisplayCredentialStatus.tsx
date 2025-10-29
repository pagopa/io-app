import { useIOSelector } from "../../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { ItwCredentialStatus } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsEidStatusSelector } from "../../../credentials/store/selectors";

/**
 * Computes the display status of a credential for UI purposes.
 *
 * This hook does not reflect the credential’s real status — it adapts
 * the status shown in the Wallet or credential details screen.
 * Specifically, it keeps credentials marked as "valid" when the user's eID
 * is expiring or expired, so that attention is focused on the eID, which is the
 * element requiring user action.
 *
 * Rules:
 * - Credentials explicitly marked as "expired", "expiring", "invalid", or "unknown"
 *   always keep their original status.
 * - In offline mode, credentials with "jwtExpiring" or "jwtExpired" status are considered "valid"
 * - When the eID status is not "valid" , credentials are temporarily shown as "valid" unless excluded.
 */
export const useItwDisplayCredentialStatus = (
  credentialStatus: ItwCredentialStatus
): ItwCredentialStatus => {
  const excludedCredentialStatuses: ReadonlyArray<ItwCredentialStatus> = [
    "expired",
    "expiring",
    "invalid",
    "unknown"
  ];
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const isCredentialExcluded =
    excludedCredentialStatuses.includes(credentialStatus);

  // In offline mode show digital credential nearing expiration and expired as valid
  if (offlineAccessReason !== undefined && !isCredentialExcluded) {
    return "valid";
  }

  if (eidStatus === "valid" || isCredentialExcluded) {
    return credentialStatus;
  }

  return "valid";
};
