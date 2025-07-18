import { Errors as ErrorsV1 } from "@pagopa/io-react-native-wallet";
import { Errors as ErrorsV2 } from "@pagopa/io-react-native-wallet-v2";
import { IssuerResponseErrorCode } from "@pagopa/io-react-native-wallet-v2/src/utils/error-codes";
import { CredentialIssuanceEvents } from "./events";

const {
  isIssuerResponseError: isIssuerResponseErrorV1,
  isWalletProviderResponseError: isWalletProviderResponseErrorV1
} = ErrorsV1;

const {
  isIssuerResponseError: isIssuerResponseErrorV2,
  isWalletProviderResponseError: isWalletProviderResponseErrorV2,
  // The error codes are the same in both V1 and V2, so for simplicity,
  // we’ll use those provided by V2 directly.
  // TODO: [SIW-2530] After fully migrating to the new API, the above comment can be removed
  IssuerResponseErrorCodes: Codes
} = ErrorsV2;

export enum CredentialIssuanceFailureType {
  UNEXPECTED = "UNEXPECTED",
  ASYNC_ISSUANCE = "ASYNC_ISSUANCE",
  INVALID_STATUS = "INVALID_STATUS",
  ISSUER_GENERIC = "ISSUER_GENERIC",
  WALLET_PROVIDER_GENERIC = "WALLET_PROVIDER_GENERIC"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [CredentialIssuanceFailureType.ISSUER_GENERIC]: ErrorsV2.IssuerResponseError;
  [CredentialIssuanceFailureType.INVALID_STATUS]: ErrorsV2.IssuerResponseError;
  [CredentialIssuanceFailureType.ASYNC_ISSUANCE]: ErrorsV2.IssuerResponseError;
  [CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC]: ErrorsV2.WalletProviderResponseError;
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

// TODO: [SIW-2530] After fully migrating to the new API, remove this layer in favor of `isIssuerResponseErrorV2`
const isIssuerResponseError = (
  error: unknown,
  code?: IssuerResponseErrorCode
): error is ErrorsV2.IssuerResponseError =>
  [isIssuerResponseErrorV1, isIssuerResponseErrorV2].some(cb =>
    cb(error, code)
  );

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

  if (
    isWalletProviderResponseErrorV1(error) ||
    isWalletProviderResponseErrorV2(error)
  ) {
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
