import { Errors } from "@pagopa/io-react-native-wallet";
import { CredentialUpgradeEvents } from "../upgrade/events";

const { isIssuerResponseError } = Errors;

export enum UpgradeCredentialFailureType {
  ISSUER_GENERIC = "ISSUER_GENERIC",
  UNEXPECTED = "UNEXPECTED"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [UpgradeCredentialFailureType.ISSUER_GENERIC]: Errors.IssuerResponseError;
  [UpgradeCredentialFailureType.UNEXPECTED]: unknown;
};

type TypedIssuanceFailures = {
  [K in UpgradeCredentialFailureType]: {
    type: K;
    reason: ReasonTypeByFailure[K];
  };
};

/*
 * Union type of failures with the reason properly typed.
 */
export type UpgradeCredentialFailure =
  TypedIssuanceFailures[keyof TypedIssuanceFailures];

export const mapUpgradeEventToFailure = (
  event: CredentialUpgradeEvents
): UpgradeCredentialFailure => {
  if (!("error" in event)) {
    return {
      type: UpgradeCredentialFailureType.UNEXPECTED,
      reason: event
    };
  }

  const { error } = event;

  if (isIssuerResponseError(error)) {
    return {
      type: UpgradeCredentialFailureType.ISSUER_GENERIC,
      reason: error
    };
  }

  return {
    type: UpgradeCredentialFailureType.UNEXPECTED,
    reason: error
  };
};
