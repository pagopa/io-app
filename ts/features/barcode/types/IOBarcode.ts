import { DecodedIOBarcode, IOBarcodeDecoders } from "./decoders";

export const IO_BARCODE_ALL_FORMATS = ["DATA_MATRIX", "QR_CODE"] as const;

export type IOBarcodeFormat = (typeof IO_BARCODE_ALL_FORMATS)[number];

export type IOBarcodeType = DecodedIOBarcode["type"];

export type IOBarcodeOrigin = "camera" | "file";

export const IO_BARCODE_ALL_TYPES = Object.keys(
  IOBarcodeDecoders
) as ReadonlyArray<IOBarcodeType>;

/**
 * Scanned barcode, it contains the information about the scanned content, its format and its type
 */
export type IOBarcode = {
  format: IOBarcodeFormat;
} & DecodedIOBarcode;

export type PagoPaBarcode = IOBarcode & { type: "PAGOPA" };
