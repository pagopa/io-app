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
