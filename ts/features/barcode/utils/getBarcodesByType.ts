import { IOBarcode, IOBarcodeType } from "../types/IOBarcode";

export type IOBarcodesByType = { [type in IOBarcodeType]?: Array<IOBarcode> };

export const getIOBarcodesByType = (
  barcodes: Array<IOBarcode>
): IOBarcodesByType =>
  barcodes.reduce((acc, barcode) => {
    const { type } = barcode;
    return {
      ...acc,
      [type]: [...(acc[type] || []), barcode]
    };
  }, {} as IOBarcodesByType);
