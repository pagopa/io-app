import { Errors, Trust } from "@pagopa/io-react-native-wallet";
import { isFederationError } from "../../common/utils/itwFailureUtils.ts";
import { WithCredentialMetadata } from "../../common/utils/ItwFailureTypes.ts";
import { CredentialIssuanceEvents } from "./events";

const {
  isIssuerResponseError,
  isWalletProviderResponseError,
  IssuerResponseErrorCodes: Codes
} = Errors;

export enum CredentialIssuanceFailureType {
  UNEXPECTED = "UNEXPECTED",
  ASYNC_ISSUANCE = "ASYNC_ISSUANCE",
  INVALID_STATUS = "INVALID_STATUS",
  ISSUER_GENERIC = "ISSUER_GENERIC",
  UNTRUSTED_ISS = "UNTRUSTED_ISS",
  WALLET_PROVIDER_GENERIC = "WALLET_PROVIDER_GENERIC"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [CredentialIssuanceFailureType.ISSUER_GENERIC]: Errors.IssuerResponseError;
  [CredentialIssuanceFailureType.INVALID_STATUS]: WithCredentialMetadata<Errors.IssuerResponseError>;
  [CredentialIssuanceFailureType.ASYNC_ISSUANCE]: Errors.IssuerResponseError;
  [CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC]: Errors.WalletProviderResponseError;
  [CredentialIssuanceFailureType.UNTRUSTED_ISS]: Trust.Errors.FederationError;
  [CredentialIssuanceFailureType.UNEXPECTED]: unknown;
};

type TypedCredentialIssuanceFailures = {
  [K in CredentialIssuanceFailureType]: {
    type: K;
    reason?: ReasonTypeByFailure[K];
  };
};

/*
 * Union type of failures with the reason properly typed.
 */
export type CredentialIssuanceFailure =
  TypedCredentialIssuanceFailures[keyof TypedCredentialIssuanceFailures];

/**
 * Maps an event dispatched by the credential issuance machine to a failure object.
 * If the event is not an error event, a generic failure is returned.
 * @param event - The event to map
 * @param context - The machine context
 * @returns a failure object which can be used to fill the failure screen with the appropriate content
 */
export const mapEventToFailure = (
  event: CredentialIssuanceEvents
): CredentialIssuanceFailure => {
  if (!("error" in event)) {
    return {
      type: CredentialIssuanceFailureType.UNEXPECTED,
      reason: event
    };
  }

  const { error } = event;

  if (isIssuerResponseError(error, Codes.CredentialInvalidStatus)) {
    return {
      type: CredentialIssuanceFailureType.INVALID_STATUS,
      reason: error
    };
  }

  if (isIssuerResponseError(error, Codes.CredentialIssuingNotSynchronous)) {
    return {
      type: CredentialIssuanceFailureType.ASYNC_ISSUANCE,
      reason: error
    };
  }

  if (isIssuerResponseError(error)) {
    return {
      type: CredentialIssuanceFailureType.ISSUER_GENERIC,
      reason: error
    };
  }

  if (isFederationError(error)) {
    return {
      type: CredentialIssuanceFailureType.UNTRUSTED_ISS,
      reason: error
    };
  }

  if (isWalletProviderResponseError(error)) {
    return {
      type: CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC,
      reason: error
    };
  }

  return {
    type: CredentialIssuanceFailureType.UNEXPECTED,
    reason: error
  };
};
