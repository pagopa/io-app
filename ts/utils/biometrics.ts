import { Alert, Platform } from "react-native";
import FingerprintScanner, {
  AuthenticateAndroid,
  AuthenticateIOS,
  Biometrics,
  FingerprintScannerError,
  Errors
} from "react-native-fingerprint-scanner";
import I18n from "i18next";
import { isDebugBiometricIdentificationEnabled } from "../config";
import { mixpanelTrack } from "../mixpanel";

/**
 * Retrieve biometric settings from the base system. This function wraps the basic
 * method "isSensorAvailable" of react-native-fingerprint-scanner library and simplifies the possible returned values in
 * function of its usage.
 *
 * More info about library can be found here: https://github.com/hieuvp/react-native-fingerprint-scanner
 */

const biometricErrors = [
  // possibly working, but the string returned is undocumented
  "UNKNOWN",

  // unspeakable horrors happened somewhere under the hood
  "UNAVAILABLE"
] as const;

export type BiometricsErrorType = (typeof biometricErrors)[number];

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
 *
 * @param shouldTrackError - If true, tracks BIOMETRIC_ERROR event on Mixpanel when biometrics are unavailable. Default: true
 */
export const getBiometricsType = (
  shouldTrackError: boolean = true
): Promise<BiometricsType> =>
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
      if (shouldTrackError) {
        void mixpanelTrack("BIOMETRIC_ERROR", {
          error: e.message ?? "unknown"
        });
      }
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

type BiometricState = "Available" | "NotEnrolled" | "NotSupported";

export const getBiometricState = async (): Promise<BiometricState> => {
  try {
    await FingerprintScanner.isSensorAvailable();
    return "Available";
  } catch (e) {
    const error = e as FingerprintScannerError;
    return error.name === "FingerprintScannerNotEnrolled"
      ? "NotEnrolled"
      : "NotSupported";
  }
};

export type BiometriActivationUserType =
  | "ACTIVATED"
  | "AUTH_FAILED"
  | "PERMISSION_DENIED"
  | "SENSOR_ERROR";

const mayUserActivateBiometricWithDependency = (
  getBiometricsTypeInternal: Promise<BiometricsType>
): Promise<BiometriActivationUserType> =>
  new Promise((resolve, reject) => {
    getBiometricsTypeInternal
      .then(value => {
        if (value === "FACE_ID") {
          FingerprintScanner.authenticate({
            description: I18n.t(
              "identification.biometric.popup.sensorDescription"
            ),
            fallbackEnabled: false
          } as AuthenticateIOS)
            .then(_ => resolve("ACTIVATED"))
            .catch((err: Errors) => {
              reject(handleErrorDuringBiometricActivation(err));
            });
        } else {
          resolve("ACTIVATED");
        }
      })
      .catch(_ => {
        reject("SENSOR_ERROR");
      });
  });

export const mayUserActivateBiometric = () =>
  mayUserActivateBiometricWithDependency(getBiometricsType());

export const biometricFunctionForTests = {
  mayUserActivateBiometricWithDependency
};

function handleErrorDuringBiometricActivation(
  err: Errors
): BiometriActivationUserType {
  if (err.name === "FingerprintScannerNotAvailable") {
    return "PERMISSION_DENIED";
  }
  return "AUTH_FAILED";
}
