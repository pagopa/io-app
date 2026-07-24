import { IOBarcodeFormat } from "./IOBarcode";

export type BarcodeFailure =
  | {
      content?: string;
      format: IOBarcodeFormat;
      reason: "UNKNOWN_CONTENT";
    }
  | {
      reason: Exclude<BarcodeFailureType, "UNKNOWN_CONTENT">;
    };

export type BarcodeFailureType =
  | "BARCODE_NOT_FOUND"
  | "INVALID_FILE"
  | "UNEXPECTED"
  | "UNKNOWN_CONTENT"
  | "UNSUPPORTED_FORMAT";
