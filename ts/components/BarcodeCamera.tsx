import "react-native-reanimated";
import React, { useEffect } from "react";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { View } from "react-native";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";

/**
 * Type describing the supported barcodes in IO.
 */
type IOBarcodeFormat = "DATA_MATRIX" | "QRCODE";

/**
 * The message sent through the `onBarcodeScanned`
 * callback.
 */
type ScannedBarcode = {
  format: IOBarcodeFormat;
  value: string;
};

/**
 * Map the barcode scanned through the underneath
 * library to one of the supported ones in IO, or `null`.
 */
function barcodeFormatToIOFormat(
  format: BarcodeFormat
): IOBarcodeFormat | null {
  switch (format) {
    case BarcodeFormat.QR_CODE:
      return "QRCODE";

    case BarcodeFormat.DATA_MATRIX:
      return "DATA_MATRIX";

    default:
      return null;
  }
}

type Props = {
  onBarcodeScanned: (barcode: ScannedBarcode) => void;
};

/**
 * A Camera view which can scan different types of
 * barcodes (QRCodes, Data Matrix, ...).
 */
export const BarcodeCamera = (props: Props) => {
  const { onBarcodeScanned } = props;
  const devices = useCameraDevices();
  const device = devices.back;

  const [frameProcessor, barcodes] = useScanBarcodes(
    [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX],
    {
      checkInverted: true
    }
  );

  useEffect(() => {
    // This is going to take only the first scanned
    // barcode. This could be improved or changed in relation
    // to the business decisions.
    const firstBarcode = barcodes[0];

    if (!firstBarcode) {
      return;
    }

    const barcodeValue = firstBarcode.content.data.toString();
    const barcodeFormat = barcodeFormatToIOFormat(firstBarcode.format);

    if (barcodeFormat === null) {
      return;
    }

    onBarcodeScanned({
      format: barcodeFormat,
      value: barcodeValue
    });
  }, [barcodes, onBarcodeScanned]);

  return (
    <View style={{ width: "100%", height: 400, flexDirection: "column" }}>
      {device && (
        <Camera
          style={{ width: "100%", height: "100%" }}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
      )}
    </View>
  );
};
