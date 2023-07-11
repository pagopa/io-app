import { useIOBarcodeScanner } from "./hooks/useIOBarcodeScanner";
import { useIOBarcodeFileReader } from "./hooks/useIOBarcodeFileReader";
import { IOBarcodeFormat, IOBarcodeType, IOBarcode } from "./types/IOBarcode";
import { BarcodeScanBaseScreenComponent } from "./components/BarcodeScanBaseScreenComponent";

export type { IOBarcodeType, IOBarcodeFormat, IOBarcode };
export {
  useIOBarcodeScanner,
  useIOBarcodeFileReader,
  BarcodeScanBaseScreenComponent
};
