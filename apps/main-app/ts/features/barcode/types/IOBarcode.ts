import { DecodedIOBarcode, IOBarcodeDecoders } from "./decoders";

export const IO_BARCODE_ALL_FORMATS = ["DATA_MATRIX", "QR_CODE"] as const;

export enum BarcodeFormat {
  "CODE_39" = "code-39",
  "CODE_128" = "code-128",
  "DATA_MATRIX" = "data-matrix",
  "ITF" = "itf",
  "QR_CODE" = "qr"
}
export type IOBarcodeFormat = (typeof IO_BARCODE_ALL_FORMATS)[number];

export type IOBarcodeOrigin = "camera" | "file";

export type IOBarcodeType = DecodedIOBarcode["type"];

export const IO_BARCODE_ALL_TYPES = Object.keys(
  IOBarcodeDecoders
) as ReadonlyArray<IOBarcodeType>;

/**
 * Scanned barcode, it contains the information about the scanned content, its format and its type
 */
export type IOBarcode = DecodedIOBarcode & {
  format: IOBarcodeFormat;
};

export type PagoPaBarcode = IOBarcode & { type: "PAGOPA" };
