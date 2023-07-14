import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevices
} from "react-native-vision-camera";
import {
  Barcode,
  BarcodeFormat,
  useScanBarcodes
} from "vision-camera-code-scanner";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { usePrevious } from "../../../../../utils/hooks/usePrevious";
import { decodeIOBarcode } from "./decoders";
import { IOBarcode, IOBarcodeFormat } from "./IOBarcode";

type IOBarcodeFormatsType = {
  [K in IOBarcodeFormat]: BarcodeFormat;
};

/**
 * Maps internal formats to external library formats
 * Necessary to work with the library {@link react-native-vision-camera}
 */
const IOBarcodeFormats: IOBarcodeFormatsType = {
  DATA_MATRIX: BarcodeFormat.DATA_MATRIX,
  QR_CODE: BarcodeFormat.QR_CODE
};

/**
 * {@link useIOBarcodeScanner} configuration
 */
export type IOBarcodeScannerConfiguration = {
  /**
   * Marker component used as camera overlay
   */
  marker?: React.ReactNode;
  /**
   * Accepted formats of codes to be scanned
   */
  formats: Array<IOBarcodeFormat>;
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: (barcode: IOBarcode) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: () => void;
  /**
   * Disables the barcode scanned
   */
  disabled?: boolean;
};

export type IOBarcodeScanner = {
  /**
   * Component that renders the camera
   */
  cameraComponent: React.ReactNode;
  /**
   * Camera permission status
   */
  cameraPermissionStatus: CameraPermissionStatus;
  /**
   * Opens the system prompt that let user to allow/deny camera permission
   */
  requestCameraPermission: () => Promise<void>;
  /**
   * Opens the system settings screen to let user to change camera permission
   */
  openCameraSettings: () => Promise<void>;
};

/**
 * Utility functions to map external formats to internal formats
 * Converts {@link BarcodeFormat} to {@link IOBarcodeFormat}.
 * Returns null if no format is found
 */
const convertToIOBarcodeFormat = (
  format: BarcodeFormat
): IOBarcodeFormat | undefined =>
  (Object.keys(IOBarcodeFormats) as Array<IOBarcodeFormat>).find(
    key => IOBarcodeFormats[key] === format
  );

/**
 * Utility functions to map internal formats to external formats
 * Converts {@link IOBarcodeFormat} to {@link BarcodeFormat}
 */
const convertFromIOBarcodeFormat = (format: IOBarcodeFormat): BarcodeFormat =>
  BarcodeFormat[format];

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
): O.Option<IOBarcode> =>
  pipe(
    barcodes,
    A.reduce(
      {} as { [key in IOBarcodeFormat]?: IOBarcode },
      (barcodes, nextBarcode) => {
        const ioBarcodeFormat = convertToIOBarcodeFormat(nextBarcode.format);

        if (ioBarcodeFormat && !barcodes[ioBarcodeFormat]) {
          const decodedBarcode = decodeIOBarcode(nextBarcode.displayValue);

          return {
            ...barcodes,
            [ioBarcodeFormat]: {
              format: ioBarcodeFormat,
              ...decodedBarcode
            }
          };
        }

        return barcodes;
      }
    ),
    O.of,
    O.map(barcodes => barcodes.QR_CODE || barcodes.DATA_MATRIX || null),
    O.chain(O.fromNullable)
  );

export const useIOBarcodeScanner = (
  config: IOBarcodeScannerConfiguration
): IOBarcodeScanner => {
  const { marker, onBarcodeSuccess, onBarcodeError, formats, disabled } =
    config;

  const prevDisabled = usePrevious(disabled);
  const devices = useCameraDevices();
  const device = devices.back;

  const [cameraPermissionStatus, setCameraPermissionStatus] =
    React.useState<CameraPermissionStatus>("not-determined");

  const [frameProcessor, barcodes] = useScanBarcodes(
    pipe(formats, A.map(convertFromIOBarcodeFormat)),
    {
      checkInverted: true
    }
  );

  /**
   * Hook that checks the camera permission on mount
   */
  React.useEffect(() => {
    Camera.getCameraPermissionStatus()
      .then(setCameraPermissionStatus)
      .catch(() => setCameraPermissionStatus("not-determined"));
  }, []);

  /**
   * Opens the system prompt to ask camera permission
   */
  const requestCameraPermission = async () => {
    const permissions = await Camera.requestCameraPermission();
    setCameraPermissionStatus(permissions);
  };

  /**
   * Opens the settings page to allow user to change the camer settings
   */
  const openCameraSettings = async () => {
    await Linking.openSettings();
    const permissions = await Camera.getCameraPermissionStatus();
    setCameraPermissionStatus(permissions);
  };

  /**
   * onBarcodeScanned trigger hook
   */
  React.useEffect(() => {
    if (barcodes.length === 0) {
      return;
    }

    // This will fix a bug on lower-end devices
    // in which the latest frame would be scanned
    // multiple times due to races conditions during
    // the camera disactivation.
    if (prevDisabled || disabled) {
      return;
    }

    pipe(
      retrieveNextBarcode(barcodes),
      O.map(onBarcodeSuccess),
      O.getOrElse(onBarcodeError)
    );
  }, [prevDisabled, disabled, barcodes, onBarcodeSuccess, onBarcodeError]);

  /**
   * Component that renders camera and marker
   */
  const cameraComponent = (
    <View style={styles.cameraContainer} testID="BarcodeScannerCameraTestID">
      {device && (
        <Camera
          style={styles.camera}
          device={device}
          audio={false}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
          isActive={!disabled}
        />
      )}
      {marker && <View style={{ alignSelf: "center" }}>{marker}</View>}
    </View>
  );

  return {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings
  };
};

const styles = StyleSheet.create({
  cameraContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: IOColors.black
  },
  camera: {
    position: "absolute",
    width: "100%",
    height: "100%"
  }
});
