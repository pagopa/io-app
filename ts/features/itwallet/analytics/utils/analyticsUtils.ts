import { CREDENTIALS_MAP, ItwPIDStatus, MixPanelCredential } from "..";
import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils";

/**
 * Maps an PID status to its corresponding Mixpanel tracking status.
 */
export const mapPIDStatusToMixpanel = (
  status: ItwJwtCredentialStatus
): ItwPIDStatus => {
  switch (status) {
    case "valid":
      return "valid";
    case "jwtExpired":
      return "expired";
    case "jwtExpiring":
      return "expiring";
    default:
      return "not_available";
  }
};

/**
 * Returns the appropriate Mixpanel credential key based on the credential type.
 * - If the IT Wallet is active, returns the V3 key.
 * - Otherwise, returns the V2 key.
 * - If the credential type does not exist in CREDENTIALS_MAP, returns "UNKNOWN" as a fallback value.
 */
export function getMixPanelCredential(
  credentialType: string,
  isItwL3: boolean
): MixPanelCredential {
  const credential = CREDENTIALS_MAP[credentialType];

  if (!credential) {
    return "UNKNOWN";
  }

  // Handle case when there is only one version of the credential
  if (typeof credential === "string") {
    return credential;
  }

  return isItwL3 ? credential.V3 : credential.V2;
}
