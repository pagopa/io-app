/**
 * Type for errors which might occur during the it-wallet flow.
 * These errors are a superset of HTTP errors with custom error codes.
 */
export type ItWalletError = {
  code: string;
  message?: string;
};

/**
 * Type for mapped errors to be displayed to the user with a title and a body.
 */
export type ItWalletMappedError = {
  title: string;
  body: string;
};

/**
 * Requirements error codes
 */
export const NFC_NOT_SUPPORTED = "NFC_NOT_SUPPORTED";

/**
 * Exports all error codes as a string literal union type.
 */
export type ItWalletErrorCodes = typeof NFC_NOT_SUPPORTED;
