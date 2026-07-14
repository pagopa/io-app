import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils";
import { IdentificationContext } from "../../machine/eid/context";
import {
  ITW_ANALYTICS_CREDENTIALS,
  ItwAnalyticsCredential
} from "../properties/propertyTypes";
import { CREDENTIALS_MAP, ItwPIDStatus, MixPanelCredential } from "./types";

/** Maps the machine identification context to the Qualtrics `auth_method` UTM parameter. */
export const toSurveyAuthMethod = (
  identification: IdentificationContext | undefined
): string => {
  if (!identification) {
    return "";
  }
  if (identification.mode === "cieId") {
    return identification.level === "L3" ? "cieidL3" : "cieidL2";
  }
  if (identification.mode === "ciePin") {
    return "ciepin";
  }
  return "spid";
};

/**
 * Maps an PID status to its corresponding Mixpanel tracking status.
 */
export const mapPIDStatusToMixpanel = (
  status: ItwJwtCredentialStatus | undefined
): ItwPIDStatus => {
  switch (status) {
    case "jwtExpired":
      return "expired";
    case "jwtExpiring":
      return "expiring";
    case "valid":
      return "valid";
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

// Type guard to check if a MixPanelCredential is an ItwAnalyticsCredential
export const isItwAnalyticsCredential = (
  c: MixPanelCredential
): c is ItwAnalyticsCredential =>
  ITW_ANALYTICS_CREDENTIALS.includes(c as ItwAnalyticsCredential);
