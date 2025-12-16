import * as TE from "fp-ts/lib/TaskEither";
import RNQRGenerator, {
  QRCodeDetectOptions,
  QRCodeScanResult
} from "rn-qr-generator";
import { BarcodeFailure } from "../types/failure";

/**
 * Creates a TaskEither that detects a barcode from an image URI
 * @param detectOptions object which may contain the uri or the base64 of the image
 * @returns
 */
export const barcodeDetectionTask = (
  detectOptions: QRCodeDetectOptions
): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
  TE.tryCatch(
    () => RNQRGenerator.detect(detectOptions),
    () => ({ reason: "UNEXPECTED" })
  );
