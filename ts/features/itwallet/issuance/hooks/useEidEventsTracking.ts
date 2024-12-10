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
      return trackItwIdRequestUnexpectedFailure(failure);
    }
  }, [failure, identification]);
};
