import { useIOSelector } from "../../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { ItwCredentialStatus } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsEidStatusSelector } from "../../../credentials/store/selectors";
import { getItwDisplayCredentialStatus } from "../utils";

/**
 * Computes the display status of a credential for UI purposes
 * by combining store selectors (eID status and offline state)
 * with the pure logic from getItwDisplayCredentialStatus.
 *
 * This hook does not reflect the credential’s real status — it adapts
 * the status shown in the Wallet or credential details screen.
 *
 * @param credentialStatus the actual status of the credential
 * @returns {ItwCredentialStatus} The status to display in the UI
 */
export const useItwDisplayCredentialStatus = (
  credentialStatus: ItwCredentialStatus
): ItwCredentialStatus => {
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const isOffline = offlineAccessReason !== undefined;
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  return getItwDisplayCredentialStatus(credentialStatus, eidStatus, isOffline);
};
