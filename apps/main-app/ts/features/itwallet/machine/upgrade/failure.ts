import { Errors } from "@pagopa/io-react-native-wallet";

import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../credential/failure";
import { CredentialUpgradeEvents } from "../upgrade/events";

const { isIssuerResponseError } = Errors;

export const mapUpgradeEventToFailure = (
  event: CredentialUpgradeEvents
): CredentialIssuanceFailure => {
  if (!("error" in event)) {
    return {
      type: CredentialIssuanceFailureType.UNEXPECTED,
      reason: event
    };
  }

  const { error } = event;

  if (isIssuerResponseError(error)) {
    return {
      type: CredentialIssuanceFailureType.ISSUER_GENERIC,
      reason: error
    };
  }

  return {
    type: CredentialIssuanceFailureType.UNEXPECTED,
    reason: error
  };
};
