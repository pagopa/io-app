import { CryptoErrorCodes } from "@pagopa/io-react-native-crypto";
import {
  IntegrityError,
  IntegrityErrorCodes
} from "@pagopa/io-react-native-integrity";
import { Errors, Trust } from "@pagopa/io-react-native-wallet";
import { z } from "zod";
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
 * Guard used to check if the error is a `GENERATION_ASSERTION_FAILED` error.
 * This occurs on iOS when the stored DCAppAttest key becomes invalid
 * (DCErrorInvalidKey, com.apple.devicecheck.error 3), e.g. after a device
 * restore or app reinstall.
 */
export const isAssertionGenerationError = (e: unknown): e is IntegrityError =>
  e instanceof Error && e.message === "GENERATION_ASSERTION_FAILED";

const CredentialNotFoundError = z.object({
  error: z.literal("credential_not_found")
});

/**
 * Guard used to identify ANPR PID 404 issuance failures.
 *
 * ANPR is the only expected issuer to surface a HTTP 404 as
 * `ERR_CREDENTIAL_INVALID_STATUS` with `credential_not_found` in `reason.error`,
 * so all three conditions are required to avoid matching generic issuer 404
 * errors.
 */
export const isAnprPidCredentialNotFoundError = (
  e: unknown
): e is Errors.IssuerResponseError =>
  Errors.isIssuerResponseError(e) &&
  e.statusCode === 404 &&
  e.code === Errors.IssuerResponseErrorCodes.CredentialInvalidStatus &&
  CredentialNotFoundError.safeParse(e.reason).success;

type ItwFailureWithReason = {
  type: string;
  reason?: unknown;
};

export const extractItwFailureCode = (failure: ItwFailureWithReason) => {
  const rawError = failure.reason;

  if (
    Errors.isWalletProviderResponseError(rawError) ||
    Errors.isIssuerResponseError(rawError)
  ) {
    return rawError.code ?? failure.type;
  }

  if (rawError instanceof Errors.IoWalletError) {
    return rawError.code;
  }

  if (rawError instanceof Error) {
    return rawError.message;
  }

  return failure.type;
};

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
