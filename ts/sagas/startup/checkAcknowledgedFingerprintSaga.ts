import { call, put, select, take } from "typed-redux-saga/macro";
import { StackActions } from "@react-navigation/native";
import { navigateToOnboardingFingerprintScreenAction } from "../../store/actions/navigation";
import { fingerprintAcknowledge } from "../../store/actions/onboarding";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import { isFingerprintAcknowledgedSelector } from "../../store/reducers/onboarding";
import { ReduxSagaEffect } from "../../types/utils";
import {
  BiometricsType,
  getBiometricsType,
  isBiometricsValidType
} from "../../utils/biometrics";
import NavigationService from "../../navigation/NavigationService";

/**
 * Query TouchID library to retrieve availability information. The ONLY cases
 * taken in consideration are:
 * * TouchID/FaceID
 * * Unavailable: Not Enrolled
 *
 * All other cases are treated as a single umbrella case "Unavailable: Not
 * supported/Others".
 */
function* onboardFingerprintIfAvailableSaga(): Generator<
  ReduxSagaEffect,
  void,
  BiometricsType
> {
  // Check if user device has biometric recognition feature by trying to
  // query data from TouchID library
  const biometricsType = yield* call(getBiometricsType);

  if (isBiometricsValidType(biometricsType)) {
    // If biometric recognition is available, navigate to the Fingerprint
    // Screen and wait for the user to press "Continue". Otherwise the whole
    // step is bypassed
    yield* call(navigateToOnboardingFingerprintScreenAction, {
      biometryType: biometricsType
    });

    // Wait for the user to press "Continue" button after having read the
    // informative text
    yield* take(fingerprintAcknowledge.request);

    // Receive the acknowledgement, then update system state that flags this
    // screen as "Read"
    yield* put(fingerprintAcknowledge.success());

    // Set Fingerprint usage system preferences to true if available and enrolled
    yield* put(
      preferenceFingerprintIsEnabledSaveSuccess({
        isFingerprintEnabled: true
      })
    );

    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.popToTop()
    );
  } else {
    // Set Fingerprint usage system preference to false otherwise
    yield* put(
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
export function* checkAcknowledgedFingerprintSaga(): Generator<
  ReduxSagaEffect,
  void,
  ReturnType<typeof isFingerprintAcknowledgedSelector>
> {
  // Query system state and check whether the user has already acknowledged biometric
  // recognition Screen. Consider that, like ToS, this should be displayed once.
  const isFingerprintAcknowledged = yield* select(
    isFingerprintAcknowledgedSelector
  );

  if (!isFingerprintAcknowledged) {
    // Navigate to the FingerprintScreen and wait for acknowledgment
    yield* call(onboardFingerprintIfAvailableSaga);
  }
}
