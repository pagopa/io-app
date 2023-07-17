import { useIOBarcodeScanner } from "./hooks/useIOBarcodeScanner";
import { useIOBarcodeFileReader } from "./hooks/useIOBarcodeFileReader";
import { IOBarcodeFormat, IOBarcodeType, IOBarcode } from "./types/IOBarcode";
import { BarcodeScanBaseScreenComponent } from "./components/BarcodeScanBaseScreenComponent";
import { BarcodeFailure } from "./types/failure";

export type { IOBarcodeType, IOBarcodeFormat, IOBarcode, BarcodeFailure };
export {
  useIOBarcodeScanner,
  useIOBarcodeFileReader,
  BarcodeScanBaseScreenComponent
};
