import * as LocalAuthentication from "expo-local-authentication";
import I18n from "i18next";
import { Alert, Platform } from "react-native";

import { isDebugBiometricIdentificationEnabled } from "../config";
import { mixpanelTrack } from "../mixpanel";

/**
 * Retrieve biometric settings from the base system. This function wraps the
 * basic method "supportedAuthenticationTypesAsync" of expo-local-authentication
 * library and simplifies the possible returned values in function of its
 * usage.
 *
 * More info about library can be found here:
 * https://github.com/expo/expo/tree/main/packages/expo-local-authentication
 */

const biometricErrors = [
  // possibly working, but the string returned is undocumented
  "UNKNOWN",

  // unspeakable horrors happened somewhere under the hood
  "UNAVAILABLE"
] as const;

export type BiometricsErrorType = (typeof biometricErrors)[number];

export type BiometricsType = BiometricsErrorType | BiometricsValidType;

export type BiometricsValidType =
  // happy path
  "BIOMETRICS" | "FACE_ID" | "TOUCH_ID";

/**
 * Retrieve biometric settings from the base system. This function wraps the
 * basic method "supportedAuthenticationTypesAsync" of expo-local-authentication
 * library and simplifies the possible returned values in function of its
 * usage.
 *
 * More info about library can be found here:
 * https://github.com/expo/expo/tree/main/packages/expo-local-authentication
 *
 * @param shouldTrackError - If true, tracks BIOMETRIC_ERROR event on Mixpanel
 *   when biometrics are unavailable. Default: true
 */
export const getBiometricsType = (
  shouldTrackError = true
): Promise<BiometricsType> =>
  LocalAuthentication.supportedAuthenticationTypesAsync()
    .then((biometryType: Array<LocalAuthentication.AuthenticationType>) => {
      if (
        biometryType.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        return "FACE_ID";
      }
      if (
        biometryType.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        return "TOUCH_ID";
      }
      if (biometryType.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return "BIOMETRICS";
      }
      return "UNKNOWN";
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

const biometricAuthenticationFailureHandler = (
  error: unknown,
  onError: (e: LocalAuthentication.LocalAuthenticationError) => void
) => {
  void mixpanelTrack("BIOMETRIC_ERROR", { error });
  if (isDebugBiometricIdentificationEnabled) {
    Alert.alert("identification.biometric.title", `KO: ${error}`);
  }
  onError(error as LocalAuthentication.LocalAuthenticationError);
  if (Platform.OS === "android") {
    void LocalAuthentication.cancelAuthenticate();
  }
};

export const biometricAuthenticationRequest = (
  onSuccess: () => void,
  onError: (e: LocalAuthentication.LocalAuthenticationError) => void
): Promise<void> =>
  LocalAuthentication.authenticateAsync(
    Platform.select({
      ios: {
        promptMessage: I18n.t(
          "identification.biometric.popup.sensorDescription"
        ),
        disableDeviceFallback: true
      },
      default: {
        promptSubtitle: I18n.t("identification.biometric.popup.title"),
        promptMessage: I18n.t(
          "identification.biometric.popup.sensorDescription"
        ),
        cancelLabel: I18n.t("global.buttons.cancel")
      }
    })
  )
    .then((result: LocalAuthentication.LocalAuthenticationResult) => {
      if (result.success) {
        onSuccess();
        // We need to explicitly release the listener to avoid bugs on android platform
        if (Platform.OS === "android") {
          void LocalAuthentication.cancelAuthenticate();
        }
      } else {
        biometricAuthenticationFailureHandler(result.error, onError);
      }
    })
    .catch(e => {
      biometricAuthenticationFailureHandler(e, onError);
    });

type BiometricState = "Available" | "NotEnrolled" | "NotSupported";

export const getBiometricState = async (): Promise<BiometricState> => {
  try {
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled ? "Available" : "NotEnrolled";
  } catch {
    return "NotSupported";
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
          LocalAuthentication.authenticateAsync({
            promptMessage: I18n.t(
              "identification.biometric.popup.sensorDescription"
            ),
            disableDeviceFallback: true
          })
            .then(_ => resolve("ACTIVATED"))
            .catch((err: LocalAuthentication.LocalAuthenticationError) => {
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
  err: LocalAuthentication.LocalAuthenticationError
): BiometriActivationUserType {
  if (err === "not_available") {
    return "PERMISSION_DENIED";
  }
  return "AUTH_FAILED";
}
