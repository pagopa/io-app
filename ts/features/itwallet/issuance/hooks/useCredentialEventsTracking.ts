import { useEffect } from "react";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../../machine/credential/failure";
import {
  CREDENTIALS_MAP,
  trackAddCredentialFailure,
  trackAddCredentialUnexpectedFailure,
  trackCredentialInvalidStatusFailure,
  trackCredentialNotEntitledFailure,
  trackItWalletDeferredIssuing
} from "../../analytics";

type Params = {
  failure: CredentialIssuanceFailure;
  credentialType?: string;
  invalidErrorCode?: string;
};

/**
 * Track errors occurred during the credential issuance process for analytics.
 */
export const useCredentialEventsTracking = ({
  failure,
  credentialType,
  invalidErrorCode
}: Params) => {
  useEffect(() => {
    if (!credentialType) {
      return;
    }

    const credential = CREDENTIALS_MAP[credentialType];

    if (failure.type === CredentialIssuanceFailureType.ASYNC_ISSUANCE) {
      return trackItWalletDeferredIssuing(credential);
    }

    if (
      failure.type === CredentialIssuanceFailureType.INVALID_STATUS &&
      invalidErrorCode === "credential_not_found"
    ) {
      return trackCredentialNotEntitledFailure({
        caused_by: "CredentialIssuer",
        reason: invalidErrorCode,
        type: failure.type,
        credential
      });
    }

    if (failure.type === CredentialIssuanceFailureType.INVALID_STATUS) {
      return trackCredentialInvalidStatusFailure({
        caused_by: "CredentialIssuer",
        reason: invalidErrorCode,
        type: failure.type,
        credential
      });
    }

    if (failure.type === CredentialIssuanceFailureType.ISSUER_GENERIC) {
      return trackAddCredentialFailure({
        reason: failure.reason,
        type: failure.type,
        credential,
        caused_by: "CredentialIssuer"
      });
    }

    if (
      failure.type === CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC
    ) {
      trackAddCredentialFailure({
        reason: failure.reason,
        type: failure.type,
        credential,
        caused_by: "WalletProvider"
      });
    }

    if (failure.type === CredentialIssuanceFailureType.UNEXPECTED) {
      return trackAddCredentialUnexpectedFailure({
        reason: failure.reason,
        type: failure.type,
        credential
      });
    }
  }, [credentialType, failure, invalidErrorCode]);
};
