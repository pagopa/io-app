import { IOColors, LoadingSpinner } from "@pagopa/io-app-design-system";
import * as R from "fp-ts/ReadonlyRecord";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  Camera,
  Code,
  CodeType,
  useCameraDevice,
  useCodeScanner
} from "react-native-vision-camera";
import { AnimatedCameraMarker } from "../components/AnimatedCameraMarker";
import {
  BarcodeFormat,
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeOrigin,
  IOBarcodeType
} from "../types/IOBarcode";
import { decodeIOBarcode } from "../types/decoders";
import { BarcodeFailure } from "../types/failure";
import { useIOStore } from "../../../store/hooks";

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
 * {@link useIOBarcodeCameraScanner} configuration
 */
export type IOBarcodeCameraScannerConfiguration = {
  /**
   * Accepted barcoded formats that can be detected. Leave empty to accept all formats.
   * If the format is not supported it will return an UNSUPPORTED_FORMAT error
   */
  barcodeFormats?: Array<IOBarcodeFormat>;
  /**
   * Accepted barcode types that can be detected. Leave empty to accept all types.
   * If the type is not supported it will return an UNKNOWN_CONTENT error
   */
  barcodeTypes?: Array<IOBarcodeType>;
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: (failure: BarcodeFailure, origin: IOBarcodeOrigin) => void;
  /**
   * Disables the barcode scanner
   */
  isDisabled?: boolean;
  /**
   * If true, the component displays a loading indicator and disables all interactions
   */
  isLoading?: boolean;
};

export type IOBarcodeCameraScanner = {
  /**
   * Component that renders the camera
   */
  cameraComponent: ReactNode;
  /**
   * Returns true if the device has a torch
   */
  hasTorch: boolean;
  /**
   * Returns true if the torch is on
   */
  isTorchOn: boolean;
  /**
   * Toggles the torch states between "on" and "off"
   */
  toggleTorch: () => void;
};

/**
 * Utility functions to map external formats to internal formats
 * Converts {@link BarcodeFormat} to {@link IOBarcodeFormat}.
 * Returns null if no format is found
 */
const convertToIOBarcodeFormat = (
  format: BarcodeFormat
): O.Option<IOBarcodeFormat> =>
  pipe(
    Object.entries(IOBarcodeFormats),
    A.findFirst(([_, value]) => value === format),
    O.map(([key, _]) => key as IOBarcodeFormat)
  );

/**
 * Utility functions to map internal formats to external formats
 * Converts {@link IOBarcodeFormat} to {@link BarcodeFormat}
 */
const convertFromIOBarcodeFormat = (format: IOBarcodeFormat): CodeType =>
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
export const retrieveNextBarcode = (barcodes: Array<Code>): O.Option<Code> =>
  pipe(
    barcodes,
    A.reduce({} as { [key in BarcodeFormat]?: Code }, (acc, next) =>
      pipe(acc, R.upsertAt(next.type.toString(), next))
    ),
    O.of,
    O.map(
      b => b[BarcodeFormat.QR_CODE] || b[BarcodeFormat.DATA_MATRIX] || null
    ),
    O.chain(O.fromNullable)
  );

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 3000;

export const useIOBarcodeCameraScanner = ({
  onBarcodeSuccess,
  onBarcodeError,
  isDisabled,
  barcodeFormats,
  barcodeTypes,
  isLoading = false
}: IOBarcodeCameraScannerConfiguration): IOBarcodeCameraScanner => {
  const store = useIOStore();
  const acceptedFormats = useMemo<Array<IOBarcodeFormat>>(
    () => barcodeFormats || ["QR_CODE", "DATA_MATRIX"],
    [barcodeFormats]
  );

  const device = useCameraDevice("back", {
    physicalDevices: ["wide-angle-camera"]
  });

  // Checks that the device has a torch
  const hasTorch = !!device?.hasTorch;
  const [isTorchOn, setTorchOn] = useState<boolean>(false);

  // This handles the resting state of the scanner after a scan
  // It is necessary to avoid multiple scans of the same barcode
  const scannerReactivateTimeoutHandler = useRef<number>(undefined);
  const [isResting, setIsResting] = useState(false);

  /**
   * Handles the detected {@link Code} and converts it to {@link IOBarcode}
   * Returns an Either with the {@link BarcodeFailure} or the {@link IOBarcode}
   */
  const handleDetectedBarcode = useCallback(
    (detectedBarcode: Code): E.Either<BarcodeFailure, IOBarcode> =>
      pipe(
        convertToIOBarcodeFormat(detectedBarcode.type as BarcodeFormat),
        O.filter(format => acceptedFormats?.includes(format) ?? true),
        E.fromOption<BarcodeFailure>(() => ({
          reason: "UNSUPPORTED_FORMAT"
        })),
        E.chain(format =>
          pipe(
            decodeIOBarcode(store.getState(), detectedBarcode.value, {
              barcodeTypes
            }),
            E.fromOption<BarcodeFailure>(() => ({
              reason: "UNKNOWN_CONTENT",
              content: detectedBarcode.value,
              format: format as IOBarcodeFormat
            })),
            E.map(barcode => ({ ...barcode, format }))
          )
        )
      ),
    [acceptedFormats, barcodeTypes, store]
  );

  /**
   * Handles the scanned barcodes and calls the callbacks for the results
   */
  const handleScannedBarcodes = useCallback(
    (codes: Array<Code>) =>
      pipe(
        retrieveNextBarcode(codes),
        O.map(detectedBarcode => {
          if (isResting || isLoading || isDisabled) {
            // Barcode scanner is disabled, skip
            return;
          }
          // After a scan (even if not successful) the decoding is disabled for a while
          // to avoid multiple scans of the same barcode
          setIsResting(true);
          // eslint-disable-next-line functional/immutable-data
          scannerReactivateTimeoutHandler.current = setTimeout(() => {
            setIsResting(false);
          }, QRCODE_SCANNER_REACTIVATION_TIME_MS);

          pipe(
            handleDetectedBarcode(detectedBarcode),
            E.fold(
              failure => onBarcodeError(failure, "camera"),
              barcode => onBarcodeSuccess([barcode], "camera")
            )
          );
        })
      ),
    [
      isDisabled,
      isResting,
      isLoading,
      handleDetectedBarcode,
      onBarcodeError,
      onBarcodeSuccess
    ]
  );

  const codeScanner = useCodeScanner({
    codeTypes: pipe(acceptedFormats, A.map(convertFromIOBarcodeFormat)),
    onCodeScanned: handleScannedBarcodes
  });

  /**
   * Hook that clears the timeout handler on unmount
   */
  useEffect(
    () => () => {
      clearTimeout(scannerReactivateTimeoutHandler.current);
    },
    [scannerReactivateTimeoutHandler]
  );

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
          codeScanner={codeScanner}
          isActive={!isDisabled}
          torch={isTorchOn ? "on" : "off"}
        />
      )}
      {!isLoading ? (
        <View style={styles.markerContainer}>
          <AnimatedCameraMarker isAnimated={!isResting && !isDisabled} />
        </View>
      ) : (
        <View style={styles.markerContainer}>
          <LoadingMarkerComponent />
        </View>
      )}
    </View>
  );

  const toggleTorch = () => setTorchOn(prev => !prev);

  return {
    cameraComponent,
    hasTorch,
    isTorchOn,
    toggleTorch
  };
};

const LoadingMarkerComponent = () => (
  <Animated.View
    entering={FadeIn}
    style={{
      flex: 1,
      justifyContent: "center",
      marginTop: "15%"
    }}
  >
    <LoadingSpinner size={76} color="white" />
  </Animated.View>
);

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
  },
  markerContainer: {
    alignSelf: "center",
    position: "absolute",
    top: 0,
    bottom: 0
  }
});
