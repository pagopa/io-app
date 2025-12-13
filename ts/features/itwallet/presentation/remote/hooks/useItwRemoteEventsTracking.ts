import { useEffect } from "react";

import { RemoteFailure, RemoteFailureType } from "../machine/failure";
import {
  ItwL3UpgradeTrigger,
  trackItwUpgradeL3Mandatory
} from "../../../analytics";
import {
  getOrderedCredential,
  trackItwRemoteIdentityNeedsVerification,
  trackItwRemoteMandatoryCredentialMissing,
  trackItwRemoteInvalidMandatoryCredential,
  trackItwRemoteRPGenericFailure,
  trackItwRemoteRPInvalidAuthResponse,
  trackItwRemoteRequestObjectFailure,
  trackItwRemoteUnexpectedFailure,
  trackItwRemoteUntrustedRP
} from "../analytics";
import {
  serializeFailureReason,
  shouldSerializeReason
} from "../../../common/utils/itwStoreUtils";

type Params = {
  failure: RemoteFailure;
};

const extractTrackingData = (credentials: Array<string>) => ({
  credential: getOrderedCredential(credentials),
  count: credentials.length
});

const origin = "ITW_REMOTE_EVENTS_TRACKING";
/**
 * Track errors occurred during the remote presentation flow for analytics.
 */
export const useItwRemoteEventsTracking = ({ failure }: Params) => {
  useEffect(() => {
    const serializedFailure = serializeFailureReason(failure, origin);
    switch (failure.type) {
      case RemoteFailureType.WALLET_INACTIVE:
        return trackItwUpgradeL3Mandatory(ItwL3UpgradeTrigger.REMOTE_QR_CODE);

      case RemoteFailureType.EID_EXPIRED:
        return trackItwRemoteIdentityNeedsVerification();

      case RemoteFailureType.UNTRUSTED_RP:
        return trackItwRemoteUntrustedRP();

      case RemoteFailureType.INVALID_REQUEST_OBJECT:
        return trackItwRemoteRequestObjectFailure(serializedFailure);

      case RemoteFailureType.MISSING_CREDENTIALS: {
        const { missingCredentials } = failure.reason;
        const { credential, count } = extractTrackingData(missingCredentials);
        return trackItwRemoteMandatoryCredentialMissing({
          missing_credential: credential,
          missing_credential_number: count
        });
      }

      case RemoteFailureType.INVALID_CREDENTIALS_STATUS: {
        const { invalidCredentials } = failure.reason;
        const { credential, count } = extractTrackingData(invalidCredentials);
        return trackItwRemoteInvalidMandatoryCredential({
          not_valid_credential: credential,
          not_valid_credential_number: count
        });
      }

      case RemoteFailureType.RELYING_PARTY_GENERIC:
        return trackItwRemoteRPGenericFailure(serializedFailure);

      case RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE:
        return trackItwRemoteRPInvalidAuthResponse(serializedFailure);

      case RemoteFailureType.UNEXPECTED:
        return trackItwRemoteUnexpectedFailure(
          shouldSerializeReason(failure) ? serializedFailure : failure
        );
    }
  }, [failure]);
};
