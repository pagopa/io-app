/**
 * Type for errors which might occur during the it-wallet flow.
 * These errors are a superset of HTTP errors with custom error codes.
 */
export type ItWalletError = {
  code: ItWalletErrorTypes;
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
export enum ItWalletErrorTypes {
  NFC_NOT_SUPPORTED = "NFC_NOT_SUPPORTED"
}
