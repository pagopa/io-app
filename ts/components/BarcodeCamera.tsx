import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { View, Dimensions, StyleSheet } from "react-native";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";
import { Text } from "native-base";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { openAppSettings } from "../utils/appSettings";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

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

const styles = StyleSheet.create({
  notAuthorizedContainer: {
    padding: customVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 14
  },

  notAuthorizedText: {
    marginBottom: 25
  },

  notAuthorizedBtn: {
    flex: 1,
    alignSelf: "stretch"
  }
});

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

  if (!permissionsGranted) {
    return (
      <View style={styles.notAuthorizedContainer}>
        <Text style={styles.notAuthorizedText}>
          {I18n.t("wallet.QRtoPay.enroll_cta")}
        </Text>

        <ButtonDefaultOpacity
          onPress={openAppSettings}
          style={styles.notAuthorizedBtn}
        >
          <Text>{I18n.t("global.buttons.settings")}</Text>
        </ButtonDefaultOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        position: "relative",
        width: "100%",
        height: screenWidth,
        backgroundColor: "#000"
      }}
    >
      {device && (
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
