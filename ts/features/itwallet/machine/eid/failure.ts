import { CryptoError } from "@pagopa/io-react-native-crypto";
import { type IntegrityError } from "@pagopa/io-react-native-integrity";
import { Errors, Trust } from "@pagopa/io-react-native-wallet";
import {
  isFederationError,
  isLocalIntegrityError
} from "../../common/utils/itwFailureUtils";
import { type EidIssuanceEvents } from "./events";

const {
  isIssuerResponseError,
  isWalletProviderResponseError,
  WalletProviderResponseErrorCodes: Codes
} = Errors;

export enum IssuanceFailureType {
  UNEXPECTED = "UNEXPECTED",
  UNSUPPORTED_DEVICE = "UNSUPPORTED_DEVICE",
  NOT_MATCHING_IDENTITY = "NOT_MATCHING_IDENTITY",
  ISSUER_GENERIC = "ISSUER_GENERIC",
  WALLET_PROVIDER_GENERIC = "WALLET_PROVIDER_GENERIC",
  WALLET_REVOCATION_ERROR = "WALLET_REVOCATION_ERROR",
  UNTRUSTED_ISS = "UNTRUSTED_ISS",
  CIE_NOT_REGISTERED = "CIE_NOT_REGISTERED"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [IssuanceFailureType.WALLET_PROVIDER_GENERIC]: Errors.WalletProviderResponseError;
  [IssuanceFailureType.ISSUER_GENERIC]: Errors.IssuerResponseError;
  [IssuanceFailureType.UNSUPPORTED_DEVICE]:
    | IntegrityError
    | CryptoError
    | Errors.WalletProviderResponseError;
  [IssuanceFailureType.NOT_MATCHING_IDENTITY]: string;
  [IssuanceFailureType.WALLET_REVOCATION_ERROR]: unknown;
  [IssuanceFailureType.UNTRUSTED_ISS]: Trust.Errors.FederationError;
  [IssuanceFailureType.CIE_NOT_REGISTERED]: string;
  [IssuanceFailureType.UNEXPECTED]: unknown;
};

type TypedIssuanceFailures = {
  [K in IssuanceFailureType]: { type: K; reason: ReasonTypeByFailure[K] };
};

/*
 * Union type of failures with the reason properly typed.
 */
export type IssuanceFailure =
  TypedIssuanceFailures[keyof TypedIssuanceFailures];

/**
 * Maps an event dispatched by the eID issuance machine to a failure object.
 * If the event is not an error event, a generic failure is returned.
 * @param event - The event to map
 * @returns a failure object which can be used to fill the failure screen with the appropriate content
 */
export const mapEventToFailure = (
  event: EidIssuanceEvents
): IssuanceFailure => {
  if (!("error" in event)) {
    return {
      type: IssuanceFailureType.UNEXPECTED,
      reason: event
    };
  }

  const { error } = event;

  if (
    isLocalIntegrityError(error) ||
    isWalletProviderResponseError(error, Codes.WalletInstanceIntegrityFailed)
  ) {
    return {
      type: IssuanceFailureType.UNSUPPORTED_DEVICE,
      reason: error
    };
  }

  if (isIssuerResponseError(error)) {
    return {
      type: IssuanceFailureType.ISSUER_GENERIC,
      reason: error
    };
  }

  if (isWalletProviderResponseError(error)) {
    return {
      type: IssuanceFailureType.WALLET_PROVIDER_GENERIC,
      reason: error
    };
  }

  if (isFederationError(error)) {
    return {
      type: IssuanceFailureType.UNTRUSTED_ISS,
      reason: error
    };
  }

  if (error instanceof Error && error.message === "CIE_NOT_REGISTERED") {
    return {
      type: IssuanceFailureType.CIE_NOT_REGISTERED,
      reason: error.message
    };
  }

  return {
    type: IssuanceFailureType.UNEXPECTED,
    reason: error
  };
};
