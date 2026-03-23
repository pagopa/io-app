import { useEffect } from "react";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../../machine/credential/failure";
import {
  trackAddCredentialFailure,
  trackAddCredentialUnexpectedFailure,
  trackCredentialInvalidStatusFailure,
  trackCredentialNotEntitledFailure,
  trackItwAddCredentialNotTrustedIssuer
} from "../analytics";
import { getMixPanelCredential } from "../../analytics/utils";
import {
  serializeFailureReason,
  shouldSerializeReason
} from "../../common/utils/itwStoreUtils";

type Params = {
  failure: CredentialIssuanceFailure;
  isItwL3: boolean;
  credentialType?: string;
  invalidErrorCode?: string;
};

/**
 * Track errors occurred during the credential issuance process for analytics.
 */

export const useCredentialEventsTracking = ({
  failure,
  isItwL3,
  credentialType,
  invalidErrorCode
}: Params) => {
  useEffect(() => {
    if (!credentialType) {
      return;
    }

    const credential = getMixPanelCredential(credentialType, isItwL3);

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

    if (failure.type === CredentialIssuanceFailureType.UNTRUSTED_ISS) {
      return trackItwAddCredentialNotTrustedIssuer({
        reason: failure.reason,
        type: failure.type,
        credential
      });
    }

    if (failure.type === CredentialIssuanceFailureType.UNEXPECTED) {
      const reasonToTrack = shouldSerializeReason(failure)
        ? serializeFailureReason(failure, "ITW_CREDENTIAL_EVENTS_TRACKING")
        : failure;

      return trackAddCredentialUnexpectedFailure({
        reason: reasonToTrack.reason,
        type: failure.type,
        credential
      });
    }
  }, [credentialType, failure, invalidErrorCode, isItwL3]);
};
