import { Errors } from "@pagopa/io-react-native-wallet";
import { CredentialUpgradeEvents } from "../upgrade/events";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../credential/failure";

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
