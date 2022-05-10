import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { View, Dimensions, StyleSheet, Vibration } from "react-native";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";
import I18n from "../i18n";
import customVariables, {
  VIBRATION_BARCODE_SCANNED_DURATION
} from "../theme/variables";
import { usePrevious } from "../utils/hooks/usePrevious";
import { openAppSettings } from "../utils/appSettings";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { Label } from "./core/typography/Label";
import { Body } from "./core/typography/Body";

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

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  cameraContainer: {
    position: "relative",
    width: "100%",
    height: screenWidth,
    backgroundColor: "#000"
  },

  camera: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },

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

/**
 * A Camera view which can scan different types of
 * barcodes (QRCodes, Data Matrix, ...).
 */
export const BarcodeCamera = (props: Props) => {
  const { onBarcodeScanned, disabled } = props;
  const prevDisabled = usePrevious(disabled);
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
    // This will fix a bug on lower-end devices
    // in which the latest frame would be scanned
    // multiple times due to races conditions during
    // the camera disactivation.
    if (prevDisabled || disabled) {
      return;
    }

    // This is going to take only the first scanned
    // barcode. This could be improved or changed in relation
    // to the business decisions.
    const nextBarcode = barcodes[0];

    if (!nextBarcode) {
      return;
    }

    const barcodeValue = nextBarcode.content.data.toString();
    const barcodeFormat = barcodeFormatToIOFormat(nextBarcode.format);

    if (barcodeFormat === null) {
      return;
    }

    // Execute an haptic feedback
    Vibration.vibrate(VIBRATION_BARCODE_SCANNED_DURATION);

    onBarcodeScanned({
      format: barcodeFormat,
      value: barcodeValue
    });
  }, [barcodes, onBarcodeScanned, disabled, prevDisabled]);

  if (!permissionsGranted) {
    return (
      <View style={styles.notAuthorizedContainer}>
        <Body color="bluegrey" style={styles.notAuthorizedText}>
          {I18n.t("wallet.QRtoPay.enroll_cta")}
        </Body>

        <ButtonDefaultOpacity
          onPress={openAppSettings}
          style={styles.notAuthorizedBtn}
        >
          <Label color="white">{I18n.t("global.buttons.settings")}</Label>
        </ButtonDefaultOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      {device && (
        <Camera
          style={styles.camera}
          device={device}
          audio={false}
          isActive={!disabled}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
      )}

      {props.marker && (
        <View style={{ alignSelf: "center" }}>{props.marker}</View>
      )}
    </View>
  );
};
