/**
 * This file defines error types for the support bottom sheet (useItwFailureSupportModal), specifically for cases
 * that don't fall under the existing IssuanceFailure and CredentialIssuanceFailure types.
 * A new global error type, ItwFailure, has been introduced to handle errors that occur
 * outside of the state machines, ensuring a unified structure for IT Wallet related failures.
 */

export enum ItwFailureType {
  ITW_REMOTE_PAYLOAD_INVALID = "ITW_REMOTE_PAYLOAD_INVALID"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [ItwFailureType.ITW_REMOTE_PAYLOAD_INVALID]: Error;
};

type TypedRemoteFailures = {
  [K in ItwFailureType]: { type: K; reason: ReasonTypeByFailure[K] };
};

/*
 * Union type of failures with the reason properly typed.
 */
export type ItwFailure = TypedRemoteFailures[keyof TypedRemoteFailures];

/**
 * Enriched error with credential metadata. Used to augment errors
 * thrown by `io-react-native-wallet` with the credential configuration ID.
 */
export type WithCredentialMetadata<E = Error> = E & {
  metadata?: { credentialId: string };
};
