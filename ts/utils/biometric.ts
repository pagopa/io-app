import { AuthenticateConfig } from "react-native-touch-id";
import FingerprintScanner, {
  AuthenticateAndroid,
  AuthenticateIOS,
  FingerprintScannerError
} from "react-native-fingerprint-scanner";
import { Alert, Platform } from "react-native";
import I18n from "../i18n";
import variables from "../theme/variables";
import { mixpanelTrack } from "../mixpanel";
import { isDebugBiometricIdentificationEnabled } from "../config";
import { BiometrySimpleType } from "../sagas/startup/checkAcknowledgedFingerprintSaga";

export const authenticateConfig: AuthenticateConfig = {
  title: I18n.t("identification.biometric.popup.title"),
  sensorDescription: I18n.t("identification.biometric.popup.sensorDescription"),
  sensorErrorDescription: I18n.t(
    "identification.biometric.popup.sensorErrorDescription"
  ),
  cancelText: I18n.t("global.buttons.cancel"),
  fallbackLabel: I18n.t("identification.biometric.popup.fallbackLabel"),
  imageColor: variables.contentPrimaryBackground,
  imageErrorColor: variables.brandDanger,
  unifiedErrors: true
};

/**
 * Retrieve biometric settings from the base system. This function wraps the basic
 * method "isSensorAvailable" of react-native-fingerprint-scanner library and simplifies the possible returned values in
 * function of its usage:
 * * FaceID/TouchID/Biometrics: in case of biometric recognition supported.
 * * Throws an error in case the Biometric option is not enrolled or not available on the device
 *
 * More info about library can be found here: https://github.com/hieuvp/react-native-fingerprint-scanner
 */
export function getFingerprintSettings(): Promise<BiometrySimpleType> {
  return new Promise((resolve, _) => {
    FingerprintScanner.isSensorAvailable()
      .then(biometryType => {
        switch (biometryType) {
          case "Touch ID":
            resolve("TOUCH_ID");
            break;
          case "Face ID":
            resolve("FACE_ID");
            break;
          case "Biometrics":
            resolve("BIOMETRICS");
            break;
          default:
            resolve("UNAVAILABLE");
            break;
        }
      })
      .catch(e => {
        void mixpanelTrack("BIOMETRIC_ERROR", { error: e });
        resolve("UNAVAILABLE");
      });
  });
}

export const biometricAuthenticationRequest = (
  onSuccess: () => void,
  onError: (e: FingerprintScannerError) => void
) => {
  FingerprintScanner.authenticate(
    Platform.select({
      ios: {
        description: I18n.t("identification.biometric.popup.sensorDescription"),
        fallbackEnabled: false
      } as AuthenticateIOS,
      default: {
        title: authenticateConfig.title,
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
};
