import { call, put, select } from "typed-redux-saga/macro";
import { fingerprintAcknowledged } from "../../../../store/actions/onboarding";
import { isFingerprintAcknowledgedSelector } from "../../../../store/reducers/onboarding";
import { ReduxSagaEffect } from "../../../../types/utils";
import { getBometricState, isDevicePinSet } from "../../../../utils/biometrics";
import { isFingerprintEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import {
  handleBiometricAvailable,
  hanldeMissingDevicePin,
  handleBiometricNotSupported,
  hanldeBiometricNotEnrolled
} from "./biometricStateSagas";

function* onboardFingerprintIfAvailableSaga(): Generator<
  ReduxSagaEffect,
  void,
  void
> {
  yield* put(fingerprintAcknowledged());

  const biometricState = yield* call(getBometricState);

  if (biometricState === "Available") {
    yield* call(handleBiometricAvailable);
  } else {
    const isOSPinSet = yield* call(isDevicePinSet);
    if (!isOSPinSet) {
      yield* call(hanldeMissingDevicePin);
      return;
    }
    if (biometricState === "NotEnrolled") {
      yield* call(hanldeBiometricNotEnrolled);
      return;
    }

    yield* call(handleBiometricNotSupported);
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

  const isFingerprintEnabled = yield* select(isFingerprintEnabledSelector);

  if (!isFingerprintAcknowledged) {
    if (isFingerprintEnabled) {
      yield* put(fingerprintAcknowledged());
    } else {
      // Navigate to the FingerprintScreen and wait for acknowledgment
      yield* call(onboardFingerprintIfAvailableSaga);
    }
  }
}
