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
  // Check if user device has biometric recognition feature by trying to
  // query data from TouchID library
  const biometryTypeOrUnsupportedReason: BiometrySimpleType = yield call(
    getFingerprintSettings
  );

  if (biometryTypeOrUnsupportedReason !== "Unavailable") {
    // If biometric recognition is available, navigate to the Fingerprint
    // Screen and wait for the user to press "Continue". Otherwise the whole
    // step is bypassed
    yield put(
      navigateToOnboardingFingerprintScreenAction({
        biometryType: biometryTypeOrUnsupportedReason
      })
    );

    // Wait for the user to press "Continue" button after having read the
    // informative text
    yield take(getType(fingerprintAcknowledge.request));

    // Receive the acknowledgement, then update system state that flags this
    // screen as "Read"
    yield put(fingerprintAcknowledge.success());
  }
}

const isTouchIdSupportedConfig: IsSupportedConfig = {
  unifiedErrors: true
};

/**
 * Retrieves fingerpint settings from the base system
 */
function getFingerprintSettings(): Promise<BiometrySimpleType> {
  return new Promise((resolve, _) => {
    TouchID.isSupported(isTouchIdSupportedConfig)
      .then(biometryType => {
        resolve(biometryType === true ? "Fingerprint" : biometryType);
      })
      .catch(reason => {
        resolve(reason.code === "NOT_ENROLLED" ? "NotEnrolled" : "Unavailable");
      });
  });
}
