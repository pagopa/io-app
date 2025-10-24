import { useIOSelector } from "../../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { ItwCredentialStatus } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsEidStatusSelector } from "../../../credentials/store/selectors";

/**
 * Computes the effective credential status to be displayed in the Wallet or in the credential details screen.
 *
 * This hook ensures that credentials remain marked as "valid" when the user's eID
 * is expiring or expired, so that the focus stays on the eID itself — the element
 * that actually requires the user’s attention.
 *
 * Rules:
 * - Credentials explicitly marked as "expired", "expiring", "invalid", or "unknown"
 *   always keep their original status.
 * - In offline mode, credentials with "jwtExpiring" or "jwtExpired" status are considered "valid"
 * - When the eID status is not "valid" , credentials
 *   are temporarily considered "valid" unless excluded.
 */
export const useItwEffectiveCredentialStatus = (
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
