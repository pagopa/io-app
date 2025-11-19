import { useEffect } from "react";
import { IdentificationContext } from "../../machine/eid/context";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import {
  ItwFlow,
  trackIdNotMatch,
  trackItwCieIdCieNotRegistered,
  trackItwIdRequestFailure,
  trackItwIdRequestUnexpectedFailure,
  trackItwUnsupportedDevice
} from "../../analytics";
import {
  serializeFailureReason,
  shouldSerializeReason
} from "../../common/utils/itwStoreUtils";

type Params = {
  failure: IssuanceFailure;
  identification?: IdentificationContext;
};

/**
 * Track errors occurred during the eID issuance process for analytics.
 */
export const useEidEventsTracking = ({ failure, identification }: Params) => {
  const itwFlow: ItwFlow = identification?.level ?? "not_available";

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

    if (
      failure.type === IssuanceFailureType.CIE_NOT_REGISTERED &&
      identification
    ) {
      return trackItwCieIdCieNotRegistered(itwFlow);
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
          ? { ...serializeFailureReason(failure), itw_flow: itwFlow }
          : { ...failure, itw_flow: itwFlow }
      );
    }
  }, [failure, identification, itwFlow]);
};
