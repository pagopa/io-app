import { useIOBarcodeCameraScanner } from "./hooks/useIOBarcodeCameraScanner";
import { useIOBarcodeFileScanner } from "./hooks/useIOBarcodeFileScanner";
import { IOBarcodeFormat, IOBarcodeType, IOBarcode } from "./types/IOBarcode";
import { BarcodeScanBaseScreenComponent } from "./components/BarcodeScanBaseScreenComponent";
import { BarcodeFailure } from "./types/failure";

export type { IOBarcodeType, IOBarcodeFormat, IOBarcode, BarcodeFailure };
export {
  useIOBarcodeCameraScanner,
  useIOBarcodeFileScanner,
  BarcodeScanBaseScreenComponent
};
