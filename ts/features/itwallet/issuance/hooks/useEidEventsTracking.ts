import { useEffect } from "react";
import {
  EidIssuanceLevel,
  IdentificationContext
} from "../../machine/eid/context";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import { ItwFlow } from "../../analytics/utils/types";
import {
  trackIdNotMatch,
  trackItwCieIdCieNotRegistered,
  trackItwIdRequestFederationFailed,
  trackItwIdRequestFailure,
  trackItwIdRequestUnexpectedFailure,
  trackItwUnsupportedDevice,
  trackMrtdPoPChallengeInfoFailed
} from "../analytics";
import {
  serializeFailureReason,
  shouldSerializeReason
} from "../../common/utils/itwStoreUtils";

type EidTrackedCredential = "ITW_ID" | "ITW_PID";

type Params = {
  failure: IssuanceFailure;
  identification?: IdentificationContext;
  issuanceLevel?: EidIssuanceLevel;
  credential: EidTrackedCredential;
};
/**
 * Maps the eID issuance level to the corresponding ItwFlow value.
 * @param issuanceLevel - The eID issuance level.
 * @returns The corresponding ItwFlow value.
 */

const mapIssuanceLevelToFlow = (issuanceLevel?: EidIssuanceLevel): ItwFlow => {
  switch (issuanceLevel) {
    case "l3":
      return "L3";
    case "l2":
    case "l2-fallback":
      return "L2";
    default:
      return "not_available";
  }
};
/**
 * Track errors occurred during the eID issuance process for analytics.
 */
export const useEidEventsTracking = ({
  failure,
  identification,
  issuanceLevel,
  credential
}: Params) => {
  const itwFlow: ItwFlow = mapIssuanceLevelToFlow(issuanceLevel);

  useEffect(() => {
    if (
      failure.type === IssuanceFailureType.NOT_MATCHING_IDENTITY &&
      identification
    ) {
      return trackIdNotMatch(identification.mode, itwFlow);
    }

    if (failure.type === IssuanceFailureType.UNSUPPORTED_DEVICE) {
      return trackItwUnsupportedDevice(failure);
    }

    if (failure.type === IssuanceFailureType.ISSUER_GENERIC && identification) {
      trackItwIdRequestFailure({
        ITW_ID_method: identification.mode,
        reason: failure.reason,
        type: failure.type,
        caused_by: "CredentialIssuer",
        itw_flow: itwFlow
      });
    }

    if (
      failure.type === IssuanceFailureType.WALLET_PROVIDER_GENERIC &&
      identification
    ) {
      return trackItwIdRequestFailure({
        ITW_ID_method: identification.mode,
        reason: failure.reason,
        type: failure.type,
        caused_by: "WalletProvider",
        itw_flow: itwFlow
      });
    }

    if (failure.type === IssuanceFailureType.UNTRUSTED_ISS) {
      return trackItwIdRequestFederationFailed({
        credential,
        reason: failure.reason,
        type: failure.type
      });
    }

    if (
      failure.type === IssuanceFailureType.CIE_NOT_REGISTERED &&
      identification
    ) {
      return trackItwCieIdCieNotRegistered(itwFlow);
    }

    if (
      failure.type === IssuanceFailureType.MRTD_CHALLENGE_INIT_ERROR &&
      identification
    ) {
      return trackMrtdPoPChallengeInfoFailed({
        ITW_ID_method: identification.mode,
        reason: failure.reason.message
      });
    }

    if (failure.type === IssuanceFailureType.UNEXPECTED) {
      /*
       * We handle two cases here:
       * 1. If failure.reason is undefined/null, we serialize the failure to provide a default message with "Reason not provided".
       * 2. If failure.reason is an empty object with no keys, we serialize it to extract message property.
       * To maintain compatibility with the existing failure tracking, we keep the original `failure` object when `failure.reason` is not empty.
       */
      return trackItwIdRequestUnexpectedFailure(
        shouldSerializeReason(failure)
          ? {
              ...serializeFailureReason(failure, "ITW_EID_EVENTS_TRACKING"),
              itw_flow: itwFlow
            }
          : { ...failure, itw_flow: itwFlow }
      );
    }
  }, [failure, identification, itwFlow, credential]);
};
