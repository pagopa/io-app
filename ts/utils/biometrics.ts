import { Alert, Platform } from "react-native";
import FingerprintScanner, {
  AuthenticateAndroid,
  AuthenticateIOS,
  Biometrics,
  FingerprintScannerError
} from "react-native-fingerprint-scanner";
import { isDebugBiometricIdentificationEnabled } from "../config";
import I18n from "../i18n";
import { mixpanelTrack } from "../mixpanel";

const biometricErrors = [
  // possibly working, but the string returned is undocumented
  "UNKNOWN",

  // unspeakable horrors happened somewhere under the hood
  "UNAVAILABLE"
] as const;

export type BiometricsErrorType = typeof biometricErrors[number];

export type BiometricsValidType =
  // happy path
  "BIOMETRICS" | "FACE_ID" | "TOUCH_ID";

export type BiometricsType = BiometricsErrorType | BiometricsValidType;

/**
 * Retrieve biometric settings from the base system. This function wraps the basic
 * method "isSensorAvailable" of react-native-fingerprint-scanner library and simplifies the possible returned values in
 * function of its usage.
 *
 * More info about library can be found here: https://github.com/hieuvp/react-native-fingerprint-scanner
 */
export const getBiometricsType = (): Promise<BiometricsType> =>
  FingerprintScanner.isSensorAvailable()
    .then((biometryType: Biometrics) => {
      switch (biometryType) {
        case "Touch ID":
          return "TOUCH_ID";
        case "Face ID":
          return "FACE_ID";
        case "Biometrics":
          return "BIOMETRICS";
        default:
          return "UNKNOWN";
      }
    })
    .catch(e => {
      void mixpanelTrack("BIOMETRIC_ERROR", { error: e.message ?? "unknown" });
      return "UNAVAILABLE";
    });

export const isBiometricsValidType = (
  biometrics: BiometricsType
): biometrics is BiometricsValidType =>
  !biometricErrors.some(err => biometrics === err);

export const biometricAuthenticationRequest = (
  onSuccess: () => void,
  onError: (e: FingerprintScannerError) => void
): Promise<void> =>
  FingerprintScanner.authenticate(
    Platform.select({
      ios: {
        description: I18n.t("identification.biometric.popup.sensorDescription"),
        fallbackEnabled: false
      } as AuthenticateIOS,
      default: {
        title: I18n.t("identification.biometric.popup.title"),
        description: I18n.t("identification.biometric.popup.sensorDescription"),
        cancelButton: I18n.t("global.buttons.cancel")
      } as AuthenticateAndroid
    })
  )
    .then(() => {
      onSuccess();
      // We need to explicitly release the listener to avoid bugs on android platform
      void FingerprintScanner.release();
    })
    .catch((e: FingerprintScannerError) => {
      void mixpanelTrack("BIOMETRIC_ERROR", { error: e });
      if (isDebugBiometricIdentificationEnabled) {
        Alert.alert("identification.biometric.title", `KO: ${e.name}`);
      }
      onError(e);
      // We need to explicitly release the listener to avoid bugs on android platform
      void FingerprintScanner.release();
    });
