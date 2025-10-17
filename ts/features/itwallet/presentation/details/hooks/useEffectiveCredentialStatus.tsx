import { useIOSelector } from "../../../../../store/hooks";
import { ItwCredentialStatus } from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialStatusSelector,
  itwIsEidExpiredOrExpiringSelector
} from "../../../credentials/store/selectors";

/**
 * Ensures that credential statuses remain marked as "valid" even when the eID
 * is expired or expiring during its reactivation process.
 *
 * This hook temporarily overrides the credential status to "valid"
 * (except for explicitly invalid, expired, or expiring ones)
 */
export const useEffectiveCredentialStatus = (
  credentialType: string
): ItwCredentialStatus => {
  const isEidExpiredOrExpiring = useIOSelector(
    itwIsEidExpiredOrExpiringSelector
  );
  const { status: credentialStatus = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credentialType)
  );

  if (
    isEidExpiredOrExpiring &&
    credentialStatus !== "expired" &&
    credentialStatus !== "expiring" &&
    credentialStatus !== "invalid"
  ) {
    return "valid";
  }

  return credentialStatus;
};
