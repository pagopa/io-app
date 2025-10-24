import { useIOSelector } from "../../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { ItwCredentialStatus } from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialStatusSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";

  /**
   * The credential's expire UI should be displayed only when:
   * - the eID status is "valid"
   * - the eID status is not "valid" and the document associated to the
   *   credential is "expiring", "expired", "invalid" or "unknown"
   */
/**
 * Ensures that credential statuses remain marked as "valid" even when the eID
 * is expired or expiring during its reactivation process.
 *
 * This hook temporarily overrides the credential status to "valid"
 * (except for explicitly invalid, expired, or expiring ones)
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
