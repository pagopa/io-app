import { ItwScreenFlowContext } from "../../../../analytics/utils/types";
import { RemoteFailureType } from "../../machine/failure";
import { ITW_REMOTE_ERRORS_EVENTS } from "../enum";

/**
 * Returns the dismiss context for a given failure type. This is used to
 * determine which screen and flow to show when a failure occurs.
 *
 * @param failureType - The type of failure that occurred
 * @returns An ItwDismissalContext object or undefined if no dismiss context is
 *   defined for the failure type
 */
export const getDismissalContextFromFailure = (
  failureType: RemoteFailureType
): ItwScreenFlowContext | undefined => {
  switch (failureType) {
    case RemoteFailureType.MISSING_CREDENTIALS:
      return {
        screen_name:
          ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_MANDATORY_CREDENTIAL_MISSING,
        itw_flow: "not_available"
      };
    case RemoteFailureType.WALLET_INACTIVE:
      return {
        screen_name: ITW_REMOTE_ERRORS_EVENTS.ITW_UPGRADE_L3_MANDATORY,
        itw_flow: "not_available"
      };
    default:
      return undefined;
  }
};
