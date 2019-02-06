import { Effect } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { navigateToOnboardingFingerprintScreenAction } from "../../store/actions/navigation";
import { fingerprintAcknowledge } from "../../store/actions/onboarding";

import TouchID, { IsSupportedConfig } from "react-native-touch-id";

export type BiometrySimpleType =
  | "Fingerprint"
  | "FaceID"
  | "TouchID"
  | "NotEnrolled"
  | "Unavailable";

export function* checkSupportedFingerprintSaga(): IterableIterator<Effect> {
  // We check whether the user's device has biometric recognition
  // capabilities by trying to retrieve it from TouchID library
  const biometryTypeOrUnsupportedReason: BiometrySimpleType = yield call(
    getFingerprintSettings
  );

  if (biometryTypeOrUnsupportedReason !== "Unavailable") {
    // Navigate to the Fingerprint Screen
    yield put(
      navigateToOnboardingFingerprintScreenAction({
        biometryType: biometryTypeOrUnsupportedReason
      })
    );

    // Here we wait for the user to acknowledge the system communication
    yield take(getType(fingerprintAcknowledge.request));

    // We're done with receiving successfully the acknowledgement, dispatch
    // the action that updates the redux state.
    yield put(fingerprintAcknowledge.success());
  }
}

const isTouchIdSupportedConfig: IsSupportedConfig = {
  unifiedErrors: true
};

/**
 * Retrieves fingerpint settings from the base system
 */
async function getFingerprintSettings(): Promise<BiometrySimpleType> {
  return new Promise((resolve, _) => {
    TouchID.isSupported(isTouchIdSupportedConfig)
      .then(biometryType => {
        resolve(biometryType === true ? "Fingerprint" : biometryType);
      })
      .catch(reason => {
        resolve((typeof reason.code === "string" &&
        reason.code === "NOT_ENROLLED"
          ? "NotEnrolled"
          : "Unavailable") as BiometrySimpleType);
      });
  });
}
