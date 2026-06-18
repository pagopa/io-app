import { IOBarcodeFormat } from "./IOBarcode";

export type BarcodeFailureType =
  | "UNEXPECTED"
  | "INVALID_FILE"
  | "BARCODE_NOT_FOUND"
  | "UNKNOWN_CONTENT"
  | "UNSUPPORTED_FORMAT";

export type BarcodeFailure =
  | {
      reason: Exclude<BarcodeFailureType, "UNKNOWN_CONTENT">;
    }
  | {
      reason: "UNKNOWN_CONTENT";
      content?: string;
      format: IOBarcodeFormat;
    };
