import { Platform } from "react-native";
import FingerprintScanner, {
  AuthenticateAndroid,
  AuthenticateIOS,
  Biometrics,
  Errors,
  FingerprintScannerError
} from "react-native-fingerprint-scanner";
import I18n from "../i18n";
import { BiometrySimpleType } from "../sagas/startup/checkAcknowledgedFingerprintSaga";

/**
 * Retrieve fingerpint settings from the base system. This function wraps the basic
 * method "isSensorAvailable" of FingerprintScanner library and simplifies the possible returned values in
 * function of its usage:
 * * FaceID/TouchID/Fingerprint: in case of biometric recognition supported.
 * * Not Enrolled: in case of biometric recognition supported but no data registered.
 * * Unavailable: for all other negative cases.
 *
 * More info about library can be found here: https://github.com/hieuvp/react-native-fingerprint-scanner#readme
 */
export function getFingerprintSettings(): Promise<BiometrySimpleType> {
  return new Promise((resolve, _) => {
    FingerprintScanner.isSensorAvailable()
      .then((biometryType: Biometrics) => {
        resolve(
          biometryType === "Biometrics"
            ? "FINGERPRINT"
            : biometryType === "Face ID"
              ? "FACE_ID"
              : "TOUCH_ID"
        );
      })
      .catch((reason: Errors) => {
        resolve(
          reason.name === "FingerprintScannerNotEnrolled"
            ? "NOT_ENROLLED"
            : "UNAVAILABLE"
        );
      });
  });
}

/**
 * Unmount the biometric authentication
 */
export const unmountBiometricAuth = (): void => FingerprintScanner.release();

/**
 * Start the biometric authentication, and return a boolean Promise with value true in case of success
 * and a FingerprintScannerError in case of failure
 */
export const fingerprintAuth = (): Promise<void> => {
  const authenticateAndroid: AuthenticateAndroid =
    Platform.Version < 23
      ? {
          onAttempt: (error: FingerprintScannerError) => error
        }
      : {
          description: I18n.t(
            "identification.biometric.popup.sensorDescription"
          ),
          negativeButtonText: I18n.t("global.buttons.cancel"),
          onAttempt: (error: FingerprintScannerError) => error
        };
  const authenticateIOS: AuthenticateIOS = {
    description: I18n.t("identification.biometric.popup.sensorDescription"),
    fallbackEnabled: true
  };
  return FingerprintScanner.authenticate(
    Platform.OS === "ios" ? authenticateIOS : authenticateAndroid
  );
};

export type FingerprintError = FingerprintScannerError;
