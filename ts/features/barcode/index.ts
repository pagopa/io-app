import { useIOBarcodeCameraScanner } from "./hooks/useIOBarcodeCameraScanner";
import { useIOBarcodeFileReader } from "./hooks/useIOBarcodeFileReader";
import { IOBarcodeFormat, IOBarcodeType, IOBarcode } from "./types/IOBarcode";
import { BarcodeScanBaseScreenComponent } from "./components/BarcodeScanBaseScreenComponent";
import { BarcodeFailure } from "./types/failure";
import {
  getIOBarcodesByType,
  IOBarcodesByType
} from "./utils/getBarcodesByType";

export type {
  IOBarcodeType,
  IOBarcodeFormat,
  IOBarcode,
  BarcodeFailure,
  IOBarcodesByType
};
export {
  useIOBarcodeCameraScanner,
  useIOBarcodeFileReader,
  BarcodeScanBaseScreenComponent,
  getIOBarcodesByType
};
