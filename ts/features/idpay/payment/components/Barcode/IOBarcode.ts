import { DecodedIOBarcode } from "./decoders";

export type IOBarcodeFormat = "DATA_MATRIX" | "QR_CODE";

export type IOBarcodeType = DecodedIOBarcode["type"];

/**
 * Scanned barcode, it contains the information about the scanned content, its format and its type
 */
export type IOBarcode = {
  format: IOBarcodeFormat;
} & DecodedIOBarcode;
