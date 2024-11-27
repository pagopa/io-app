import { Errors } from "@pagopa/io-react-native-wallet";
import {
  type IntegrityError,
  type IntegrityErrorCodes
} from "@pagopa/io-react-native-integrity";
import { CryptoErrorCodes, CryptoError } from "@pagopa/io-react-native-crypto";
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
  WALLET_REVOCATION_ERROR = "WALLET_REVOCATION_ERROR"
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

  return {
    type: IssuanceFailureType.UNEXPECTED,
    reason: error
  };
};

/**
 * Integrity errors thrown by the device.
 * These errors might occur locally before calling the Wallet Provider.
 */
const localIntegrityErrors: Array<IntegrityErrorCodes | CryptoErrorCodes> = [
  "REQUEST_ATTESTATION_FAILED",
  "UNSUPPORTED_DEVICE",
  "UNSUPPORTED_IOS_VERSION",
  "UNSUPPORTED_SERVICE",
  "WRONG_KEY_CONFIGURATION",
  "API_LEVEL_NOT_SUPPORTED",
  "PREPARE_FAILED",
  "KEY_IS_NOT_HARDWARE_BACKED",
  "GENERATION_KEY_FAILED"
];

const isLocalIntegrityError = (e: unknown): e is IntegrityError =>
  e instanceof Error &&
  localIntegrityErrors.includes(e.message as IntegrityErrorCodes);
