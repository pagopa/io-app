import { BarcodeScanBaseScreenComponent } from "./components/BarcodeScanBaseScreenComponent";
import { useIOBarcodeFileReader } from "./hooks/useIOBarcodeFileReader";
import { BarcodeFailure } from "./types/failure";
import { IOBarcode, IOBarcodeFormat, IOBarcodeType } from "./types/IOBarcode";
import { IOBarcodesByType } from "./utils/getBarcodesByType";

export { BarcodeScanBaseScreenComponent, useIOBarcodeFileReader };
export type {
  BarcodeFailure,
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodesByType,
  IOBarcodeType
};
