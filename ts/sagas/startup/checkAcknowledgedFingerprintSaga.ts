import { Effect } from "redux-saga";
import { call, put, select, take } from "redux-saga/effects";
import { navigateToOnboardingFingerprintScreenAction } from "../../store/actions/navigation";
import { fingerprintAcknowledge } from "../../store/actions/onboarding";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import { isFingerprintAcknowledgedSelector } from "../../store/reducers/onboarding";
import { GlobalState } from "../../store/reducers/types";
import { getFingerprintSettings } from "../../utils/fingerprint";
export type BiometrySimpleType =
  | "FINGERPRINT"
  | "FACE_ID"
  | "TOUCH_ID"
  | "NOT_ENROLLED"
  | "UNAVAILABLE";

/**
 * Query TouchID library to retrieve availability information. The ONLY cases
 * taken in consideration are:
 * * TouchID/FaceID
 * * Unavailable: Not Enrolled
 *
 * All other cases are treated as a single umbrella case "Unavailable: Not
 * supported/Others".
 */
function* onboardFingerprintIfAvailableSaga(): IterableIterator<Effect> {
  // Check if user device has biometric recognition feature by trying to
  // query data from TouchID library
  const biometryTypeOrUnsupportedReason: BiometrySimpleType = yield call(
    getFingerprintSettings
  );

  if (biometryTypeOrUnsupportedReason !== "UNAVAILABLE") {
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
    yield take(fingerprintAcknowledge.request);

    // Receive the acknowledgement, then update system state that flags this
    // screen as "Read"
    yield put(fingerprintAcknowledge.success());

    // Set Fingerprint usage system preferences to true if available and enrolled
    yield put(
      preferenceFingerprintIsEnabledSaveSuccess({
        isFingerprintEnabled: biometryTypeOrUnsupportedReason !== "NOT_ENROLLED"
      })
    );
  } else {
    // Set Fingerprint usage system preference to false otherwise
    yield put(
      preferenceFingerprintIsEnabledSaveSuccess({
        isFingerprintEnabled: false
      })
    );
  }
}

/**
 * Retrieve from system state information about whether Fingerprint screen has
 * already been displayed or not. If yes, it ends the process. It launches the
 * saga that prompts it, otherwise. Consider that, like ToS, this should happen
 * at first launch of the app ONLY.
 */
export function* checkAcknowledgedFingerprintSaga(): IterableIterator<Effect> {
  // Query system state and check whether the user has already acknowledged biometric
  // recognition Screen. Consider that, like ToS, this should be displayed once.
  const isFingerprintAcknowledged: ReturnType<
    typeof isFingerprintAcknowledgedSelector
  > = yield select<GlobalState>(isFingerprintAcknowledgedSelector);

  if (!isFingerprintAcknowledged) {
    // Navigate to the FingerprintScreen and wait for acknowledgment
    yield call(onboardFingerprintIfAvailableSaga);
  }
}
