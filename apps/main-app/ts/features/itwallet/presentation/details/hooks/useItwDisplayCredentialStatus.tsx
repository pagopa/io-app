import { useIOSelector } from "../../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
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
 * @param credentialType the credential type, used to tell the PID apart since it
 * shares its status with the eID and must not mask itself
 * @returns {ItwCredentialStatus} The status to display in the UI
 */
export const useItwDisplayCredentialStatus = (
  credentialStatus: ItwCredentialStatus,
  credentialType: string
): ItwCredentialStatus => {
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  // The reason is reset to `undefined`, never to `null`, when the user is back online
  const isOffline = offlineAccessReason !== undefined;
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  return getItwDisplayCredentialStatus(
    credentialStatus,
    eidStatus,
    isOffline,
    credentialType === CredentialType.PID
  );
};
