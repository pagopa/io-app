import { IOPictograms } from "@pagopa/io-app-design-system";

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
  pictogram?: IOPictograms;
};

/**
 * Requirements error codes
 */
export enum ItWalletErrorTypes {
  NFC_NOT_SUPPORTED = "NFC_NOT_SUPPORTED",
  WIA_ISSUING_ERROR = "WIA_ISSUING_ERROR", // not mapped yet,
  PID_ISSUING_ERROR = "PID_ISSUING_ERR", // not mapped yet
  PID_DECODING_ERROR = "PID_DECODING_ERROR", // not mapped yet
  RP_INITIALIZATION_ERROR = "RP_INITIALIZATION_ERROR", // not mapped yet
  RP_PRESENTATION_ERROR = "RP_PRESENTATION_ERROR", // not mapped yet
  CREDENTIALS_ADD_ERROR = "CREDENTIALS_ADD_ERROR" // not mapped yet
}
