import { CryptoErrorCodes } from "@pagopa/io-react-native-crypto";
import {
  IntegrityError,
  IntegrityErrorCodes
} from "@pagopa/io-react-native-integrity";
import { Trust } from "@pagopa/io-react-native-wallet";
import { WithCredentialMetadata } from "./ItwFailureTypes";

/**
 * This file contains utility functions related to failures in the context of common xState flows
 */

/**
 * Guard used to check if the error is a `FederationError`.
 */
export const isFederationError = (
  error: unknown
): error is Trust.Errors.FederationError =>
  error instanceof Trust.Errors.FederationError;

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

export const isLocalIntegrityError = (e: unknown): e is IntegrityError =>
  e instanceof Error &&
  localIntegrityErrors.includes(e.message as IntegrityErrorCodes);

/**
 * Enrich instances of Error with `credentialId` so it is possible to retrieve the credential configuration
 * from `credential_configurations_supported` in the Issuer's EC. This is needed during multi-credential issuance
 * to get dynamic error messages, because the original error may not contain the credential configuration ID.
 *
 * This function **modifies the original error**.
 *
 * @param metadata.credentialId The credential configuration ID
 * @return A function that enriches the error and rethrows it
 * @throws The original error, with the new `metadata` property
 */
export const enrichErrorWithMetadata =
  (metadata: { credentialId: string }) => (err: unknown) => {
    if (err instanceof Error) {
      // eslint-disable-next-line functional/immutable-data
      (err as WithCredentialMetadata).metadata = metadata;
    }
    throw err;
  };
