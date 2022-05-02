import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { View, Dimensions } from "react-native";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";

/**
 * Type describing the supported barcodes in IO.
 */
export type IOBarcodeFormat = "QRCODE";

/**
 * The message sent through the `onBarcodeScanned`
 * callback.
 */
export type ScannedBarcode = {
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

    default:
      return null;
  }
}

type Props = {
  onBarcodeScanned: (barcode: ScannedBarcode) => void;
  disabled?: boolean;
  marker?: React.ReactNode;
};

const screenWidth = Dimensions.get("screen").width;

/**
 * A Camera view which can scan different types of
 * barcodes (QRCodes, Data Matrix, ...).
 */
export const BarcodeCamera = (props: Props) => {
  const { onBarcodeScanned, disabled } = props;
  const devices = useCameraDevices();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const device = devices.back;

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true
  });

  // Hook that handles the permissions initialization.
  useEffect(() => {
    async function checkPermissions() {
      const cameraPermissions = await Camera.getCameraPermissionStatus();

      if (cameraPermissions === "not-determined") {
        const selectedPermissions = await Camera.requestCameraPermission();
        setPermissionsGranted(selectedPermissions === "authorized");
      } else {
        setPermissionsGranted(cameraPermissions === "authorized");
      }
    }

    void checkPermissions();
  }, [setPermissionsGranted]);

  // Hook that handles the `onBarcodeScanned` callback.
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
    <View
      style={{
        position: "relative",
        width: "100%",
        height: screenWidth,
        backgroundColor: "#000"
      }}
    >
      {device && permissionsGranted && (
        <Camera
          style={{ position: "absolute", width: "100%", height: "100%" }}
          device={device}
          isActive={!disabled}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
      )}

      <View style={{ alignSelf: "center" }}>{props.marker}</View>
    </View>
  );
};
