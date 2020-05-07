import { Platform } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import I18n from "../i18n";
import { BiometrySimpleType } from "../sagas/startup/checkAcknowledgedFingerprintSaga";

/**
 * Retrieve fingerpint settings from the base system. This function wraps the basic
 * method "isSensorAvailable" of ReactNativeBiometrics library and simplifies the possible returned values in
 * function of its usage:
 * * FaceID/TouchID/Fingerprint: in case of biometric recognition supported.
 * * Unavailable: for all negative cases.
 *
 * More info about library can be found here: https://github.com/hieuvp/react-native-fingerprint-scanner#readme
 */
export const getFingerprintSettings = (): Promise<BiometrySimpleType> => {
  return ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
    const { available, biometryType } = resultObject;

    if (available && biometryType === ReactNativeBiometrics.TouchID) {
      return "TOUCH_ID";
    } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
      return "FACE_ID";
    } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
      return "FINGERPRINT";
    } else {
      return "UNAVAILABLE";
    }
  });
};

/**
 * Unmount the biometric authentication
 * ReactNativeBiometrics don't has a method for unmount the biometric auth
 */
// tslint:disable-next-line: no-empty
export const unmountBiometricAuth = (): void => {};

/**
 * Start the biometric authentication, and return a boolean Promise with value true in case of success
 * and a FingerprintScannerError in case of failure
 */
export const fingerprintAuth = (): Promise<boolean | FingerprintError> => {
  const authenticateAndroid = {
    promptMessage: I18n.t("identification.biometric.popup.reason"),
    cancelButtonText: I18n.t("global.buttons.cancel")
  };
  const authenticateIOS = {
    promptMessage: I18n.t("identification.biometric.popup.reason")
  };
  return ReactNativeBiometrics.simplePrompt(
    Platform.select({
      ios: authenticateIOS,
      android: authenticateAndroid
    })
  )
    .then(resultObject => {
      const { success } = resultObject;
      if (success === true) {
        return success;
      } else {
        throw new Error("error_authenticate");
      }
    })
    .catch((error: string | undefined) => {
      throw new Error(error);
    });
};

export type FingerprintError = Error;
