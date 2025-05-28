import { BarcodeScanBaseScreenComponent } from "./components/BarcodeScanBaseScreenComponent";
import { useIOBarcodeFileReader } from "./hooks/useIOBarcodeFileReader";
import { IOBarcode, IOBarcodeFormat, IOBarcodeType } from "./types/IOBarcode";
import { BarcodeFailure } from "./types/failure";
import { IOBarcodesByType } from "./utils/getBarcodesByType";

export { BarcodeScanBaseScreenComponent, useIOBarcodeFileReader };
export type {
  BarcodeFailure,
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeType,
  IOBarcodesByType
};
