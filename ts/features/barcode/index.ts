import { useIOBarcodeCameraScanner } from "./hooks/useIOBarcodeCameraScanner";
import { useIOBarcodeFileScanner } from "./hooks/useIOBarcodeFileScanner";
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
  useIOBarcodeFileScanner,
  BarcodeScanBaseScreenComponent,
  getIOBarcodesByType
};
