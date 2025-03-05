import { useEffect } from "react";
import { IdentificationContext } from "../../machine/eid/context";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import {
  trackIdNotMatch,
  trackItwIdRequestFailure,
  trackItwIdRequestUnexpectedFailure,
  trackItwUnsupportedDevice
} from "../../analytics";
import { serializeFailureReason } from "../../common/utils/itwStoreUtils";

type Params = {
  failure: IssuanceFailure;
  identification?: IdentificationContext;
};

/**
 * Track errors occurred during the eID issuance process for analytics.
 */
export const useEidEventsTracking = ({ failure, identification }: Params) => {
  useEffect(() => {
    if (
      failure.type === IssuanceFailureType.NOT_MATCHING_IDENTITY &&
      identification
    ) {
      return trackIdNotMatch(identification.mode);
    }

    if (failure.type === IssuanceFailureType.UNSUPPORTED_DEVICE) {
      return trackItwUnsupportedDevice(failure);
    }

    if (failure.type === IssuanceFailureType.ISSUER_GENERIC && identification) {
      trackItwIdRequestFailure({
        ITW_ID_method: identification.mode,
        reason: failure.reason,
        type: failure.type,
        caused_by: "CredentialIssuer"
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
        caused_by: "WalletProvider"
      });
    }

    if (failure.type === IssuanceFailureType.UNEXPECTED) {
      /*
       * We handle two cases here:
       * 1. If failure.reason is undefined/null, we serialize the failure to provide a default message with "Reason not provided".
       * 2. If failure.reason is an empty object with no keys, we serialize it to extract message property.
       * To maintain compatibility with the existing failure tracking, we keep the original `failure` object when `failure.reason` is not empty.
       */
      const shouldSerializeReason =
        !failure.reason ||
        (typeof failure.reason === "object" &&
          Object.keys(failure.reason).length === 0);

      return trackItwIdRequestUnexpectedFailure(
        shouldSerializeReason ? serializeFailureReason(failure) : failure
      );
    }
  }, [failure, identification]);
};
