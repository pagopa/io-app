import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { View, Dimensions, StyleSheet } from "react-native";
import {
  useScanBarcodes,
  BarcodeFormat,
  Barcode
} from "vision-camera-code-scanner";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { usePrevious } from "../utils/hooks/usePrevious";
import { openAppSettings } from "../utils/appSettings";
import { useIOSelector } from "../store/hooks";
import { barcodesScannerConfigSelector } from "../store/reducers/backendStatus";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { Label } from "./core/typography/Label";
import { Body } from "./core/typography/Body";
import { IOColors } from "./core/variables/IOColors";

/**
 * Type describing the supported barcodes in IO.
 */
export type IOBarcodeFormat = "QRCODE" | "DATA_MATRIX";

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

    case BarcodeFormat.DATA_MATRIX:
      return "DATA_MATRIX";

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
    backgroundColor: IOColors.black
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

/**
 * Retrieve the next barcode to handle from a list
 * of scansioned barcodes. This could be improved or
 * changed in relation to the business decisions.
 *
 * This function _should_ take performance in mind even
 * though the `barcodes` array should be quite small. This is
 * because in very low-end device the barcode scan is slower
 * than the previous implementation. In the current state it has
 * a complexity of ~O(n).
 *
 * At the moment the precedence order is:
 *  1. QR Code
 *  2. Data Matrix
 */
export const retrieveNextBarcode = (
  barcodes: Array<Barcode>
): Barcode | null => {
  if (barcodes.length === 0) {
    return null;
  }

  const chosenBarcodes: { [key in IOBarcodeFormat]?: Barcode } = {};

  barcodes.forEach(barcode => {
    const ioBarcodeFormat = barcodeFormatToIOFormat(barcode.format);

    if (ioBarcodeFormat && !chosenBarcodes[ioBarcodeFormat]) {
      // eslint-disable-next-line
      chosenBarcodes[ioBarcodeFormat] = barcode;
    }
  });

  return chosenBarcodes.QRCODE || chosenBarcodes.DATA_MATRIX || null;
};

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
  const barcodeConfig = useIOSelector(barcodesScannerConfigSelector);

  const [frameProcessor, barcodes] = useScanBarcodes(
    [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX],
    {
      checkInverted: true
    }
  );

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

    const nextBarcode = retrieveNextBarcode(barcodes);

    if (!nextBarcode) {
      return;
    }

    const barcodeValue = nextBarcode.content.data.toString();
    const barcodeFormat = barcodeFormatToIOFormat(nextBarcode.format);

    if (barcodeFormat === null) {
      return;
    }

    // If the next barcode scanned is a Data Matrix
    // but the feature flag is not enabled we avoid
    // triggering the callback.
    if (
      !barcodeConfig.dataMatrixPosteEnabled &&
      barcodeFormat === "DATA_MATRIX"
    ) {
      return;
    }

    onBarcodeScanned({
      format: barcodeFormat,
      value: barcodeValue
    });
  }, [barcodes, barcodeConfig, onBarcodeScanned, disabled, prevDisabled]);

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
