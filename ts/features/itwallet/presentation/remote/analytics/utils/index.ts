import {
  CREDENTIALS_MAP,
  ItwScreenFlowContext,
  MixPanelCredential,
  MixPanelCredentialVersion
} from "../../../../analytics/utils/types";
import { RemoteFailureType } from "../../machine/failure";
import { ITW_REMOTE_ERRORS_EVENTS } from "../enum";

// Type guard to check if an unknown object is a Record of MixPanelCredentialVersion to MixPanelCredential
const isCredentialRecord = (
  c: unknown
): c is Record<MixPanelCredentialVersion, MixPanelCredential> =>
  typeof c === "object" && c !== null && "V3" in c;

/**
 * Returns a string of missing or invalid credentials formatted for tracking,
 * ordered according to a predefined priority.
 *
 * It checks which credentials from a predefined list (CREDENTIALS_MAP)
 * are included in the input array, maps them to their Mixpanel names,
 * and joins them with " - ".
 *
 * Example:
 * Input: ["mDL", "EuropeanHealthInsuranceCard"]
 * Output: "ITW_PG_V3 - ITW_TS_V3"
 */
export const getOrderedCredential = (
  missingCredentials: Array<string>
): string =>
  Object.keys(CREDENTIALS_MAP)
    .filter(credentialType => missingCredentials.includes(credentialType))
    .map(credentialType => CREDENTIALS_MAP[credentialType])
    .filter(isCredentialRecord)
    .map(credential => credential.V3)
    .join(" - ");

/**
 * Returns the dismiss context for a given failure type.
 * This is used to determine which screen and flow to show when a failure occurs.
 * @param failureType - The type of failure that occurred
 * @returns An ItwDismissalContext object or undefined if no dismiss context is defined for the failure type
 */
export const getDismissalContextFromFailure = (
  failureType: RemoteFailureType
): ItwScreenFlowContext | undefined => {
  switch (failureType) {
    case RemoteFailureType.WALLET_INACTIVE:
      return {
        screen_name: ITW_REMOTE_ERRORS_EVENTS.ITW_UPGRADE_L3_MANDATORY,
        itw_flow: "not_available"
      };
    case RemoteFailureType.MISSING_CREDENTIALS:
      return {
        screen_name:
          ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_MANDATORY_CREDENTIAL_MISSING,
        itw_flow: "not_available"
      };
    default:
      return undefined;
  }
};
