import { CryptoError } from "@pagopa/io-react-native-crypto";
import { type IntegrityError } from "@pagopa/io-react-native-integrity";
import { Errors, Trust } from "@pagopa/io-react-native-wallet";

import {
  isAssertionGenerationError,
  isFederationError,
  isLocalIntegrityError
} from "../../common/utils/itwFailureUtils";
import { type EidIssuanceEvents } from "./events";

const {
  isIssuerResponseError,
  isWalletProviderResponseError,
  WalletProviderResponseErrorCodes: Codes,
  IssuerResponseErrorCodes: IssuerCodes
} = Errors;

export enum IssuanceFailureType {
  CIE_NOT_REGISTERED = "CIE_NOT_REGISTERED",
  HARDWARE_KEY_INVALID = "HARDWARE_KEY_INVALID",
  ISSUER_GENERIC = "ISSUER_GENERIC",
  MRTD_CHALLENGE_INIT_ERROR = "MRTD_CHALLENGE_INIT_ERROR",
  NOT_MATCHING_IDENTITY = "NOT_MATCHING_IDENTITY",
  UNEXPECTED = "UNEXPECTED",
  UNSUPPORTED_DEVICE = "UNSUPPORTED_DEVICE",
  UNTRUSTED_ISS = "UNTRUSTED_ISS",
  WALLET_PROVIDER_GENERIC = "WALLET_PROVIDER_GENERIC",
  WALLET_REVOCATION_ERROR = "WALLET_REVOCATION_ERROR"
}

/*
 * Union type of failures with the reason properly typed.
 */
export type IssuanceFailure =
  TypedIssuanceFailures[keyof TypedIssuanceFailures];

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [IssuanceFailureType.CIE_NOT_REGISTERED]: string;
  [IssuanceFailureType.HARDWARE_KEY_INVALID]: IntegrityError;
  [IssuanceFailureType.ISSUER_GENERIC]: Errors.IssuerResponseError;
  [IssuanceFailureType.MRTD_CHALLENGE_INIT_ERROR]: Errors.IssuerResponseError;
  [IssuanceFailureType.NOT_MATCHING_IDENTITY]: string;
  [IssuanceFailureType.UNEXPECTED]: unknown;
  [IssuanceFailureType.UNSUPPORTED_DEVICE]:
    | CryptoError
    | Errors.WalletProviderResponseError
    | IntegrityError;
  [IssuanceFailureType.UNTRUSTED_ISS]: Trust.Errors.FederationError;
  [IssuanceFailureType.WALLET_PROVIDER_GENERIC]: Errors.WalletProviderResponseError;
  [IssuanceFailureType.WALLET_REVOCATION_ERROR]: unknown;
};

type TypedIssuanceFailures = {
  [K in IssuanceFailureType]: { reason: ReasonTypeByFailure[K]; type: K };
};

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

  if (isAssertionGenerationError(error)) {
    return {
      type: IssuanceFailureType.HARDWARE_KEY_INVALID,
      reason: error
    };
  }

  if (
    isLocalIntegrityError(error) ||
    isWalletProviderResponseError(error, Codes.WalletInstanceIntegrityFailed)
  ) {
    return {
      type: IssuanceFailureType.UNSUPPORTED_DEVICE,
      reason: error
    };
  }

  if (
    isIssuerResponseError(error, IssuerCodes.MrtdChallengeInitRequestFailed)
  ) {
    return {
      type: IssuanceFailureType.MRTD_CHALLENGE_INIT_ERROR,
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
