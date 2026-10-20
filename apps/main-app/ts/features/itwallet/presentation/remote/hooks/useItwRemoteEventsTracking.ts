import { useEffect } from "react";

import {
  serializeFailureReason,
  shouldSerializeReason
} from "../../../common/utils/itwStoreUtils";
import {
  trackItwRemoteIdentityNeedsVerification,
  trackItwRemoteInvalidMandatoryCredential,
  trackItwRemoteMandatoryCredentialMissing,
  trackItwRemoteRequestObjectFailure,
  trackItwRemoteRPGenericFailure,
  trackItwRemoteRPInvalidAuthResponse,
  trackItwRemoteUnexpectedFailure,
  trackItwRemoteUntrustedRP,
  trackItwUpgradeL3Mandatory
} from "../analytics";
import { ItwL3UpgradeTrigger } from "../analytics/utils/types";
import { RemoteFailure, RemoteFailureType } from "../machine/failure";

type Params = {
  failure: RemoteFailure;
};

/** Track errors occurred during the remote presentation flow for analytics. */
export const useItwRemoteEventsTracking = ({ failure }: Params) => {
  useEffect(() => {
    const serializedFailure = serializeFailureReason(failure);
    switch (failure.type) {
      case RemoteFailureType.EID_EXPIRED:
        return trackItwRemoteIdentityNeedsVerification();

      case RemoteFailureType.INVALID_CREDENTIALS_STATUS:
        return trackItwRemoteInvalidMandatoryCredential();

      case RemoteFailureType.INVALID_REQUEST_OBJECT:
        return trackItwRemoteRequestObjectFailure(serializedFailure);

      case RemoteFailureType.MISSING_CREDENTIALS:
        return trackItwRemoteMandatoryCredentialMissing();

      case RemoteFailureType.RELYING_PARTY_GENERIC:
        return trackItwRemoteRPGenericFailure(serializedFailure);

      case RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE:
        return trackItwRemoteRPInvalidAuthResponse(serializedFailure);

      case RemoteFailureType.UNEXPECTED:
        return trackItwRemoteUnexpectedFailure(
          shouldSerializeReason(failure)
            ? { ...serializedFailure, origin: "ITW_REMOTE_EVENTS_TRACKING" }
            : failure
        );

      case RemoteFailureType.UNTRUSTED_RP:
        return trackItwRemoteUntrustedRP();

      case RemoteFailureType.WALLET_INACTIVE:
        return trackItwUpgradeL3Mandatory(ItwL3UpgradeTrigger.REMOTE_QR_CODE);
    }
  }, [failure]);
};
