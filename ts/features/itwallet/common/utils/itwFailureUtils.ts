import { CryptoErrorCodes } from "@pagopa/io-react-native-crypto";
import {
  IntegrityError,
  IntegrityErrorCodes
} from "@pagopa/io-react-native-integrity";
import { Trust } from "@pagopa/io-react-native-wallet-v2";

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
