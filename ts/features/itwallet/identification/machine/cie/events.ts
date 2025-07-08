import { CieError } from "@pagopa/io-react-native-cie";

type Close = {
  type: "close";
};

/**
 * Events emitted by the CieManager during the reading process.
 * It containes the progress of the reading proicess
 */
type CieReadEvent = {
  type: "cie-read-event";
  progress: number;
};

/**
 * Events emitted by the CieManager when an error occurs during the reading process.
 * It contains the error details.
 */
type CieReadError = {
  type: "cie-read-error";
  error: CieError;
};

/**
 * Events emitted by the CieManager when the reading process is successful.
 * It contains the authorization URL to be used for further actions.
 */
type CieReadSuccess = {
  type: "cie-read-success";
  authorizationUrl: string;
};

export type CieEvents = Close | CieReadEvent | CieReadError | CieReadSuccess;
