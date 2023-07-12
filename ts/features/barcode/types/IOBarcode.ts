// Discriminated barcode type
// Represents the decoded content of a barcode that has been scanned
// To add a new barcode type, add a new type here and add the decoder function to the IOBarcodeDecoders object
//
// Example:
//
// export type DecodedIOBarcode = {
//    type: "IDPAY";
//    authUrl: string;
//    trxCode: string;
// } | {
//   type: "MY_NEW_BARCODE_TYPE";
//   content: string;
// };
export type DecodedIOBarcode = {
  type: "IDPAY";
  authUrl: string;
  trxCode: string;
};

export type IOBarcodeFormat = "DATA_MATRIX" | "QR_CODE";

export type IOBarcodeType = DecodedIOBarcode["type"];

/**
 * Scanned barcode, it contains the information about the scanned content, its format and its type
 */
export type IOBarcode = {
  format: IOBarcodeFormat;
} & DecodedIOBarcode;
