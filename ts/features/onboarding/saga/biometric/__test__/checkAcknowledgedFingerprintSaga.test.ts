import { testSaga } from "redux-saga-test-plan";
import { fingerprintAcknowledged } from "../../../../../features/onboarding/store/actions";
import { isFingerprintAcknowledgedSelector } from "../../../../../features/onboarding/store/selectors";
import { isFingerprintEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import {
  checkAcknowledgedFingerprintSaga,
  testable
} from "../checkAcknowledgedFingerprintSaga";
import {
  handleBiometricAvailable,
  hanldeBiometricNotEnrolled,
  hanldeMissingDevicePin,
  handleBiometricNotSupported
} from "../biometricStateSagas";
import { getBometricState } from "../../../../../utils/biometrics";
import { isScreenLockSet } from "../../../../../utils/device";

describe("checkAcknowledgedFingerprintSaga", () => {
  it("should do nothing if fingerprint already acknowledged", () => {
    testSaga(checkAcknowledgedFingerprintSaga)
      .next()
      .select(isFingerprintAcknowledgedSelector)
      .next(true)
      .select(isFingerprintEnabledSelector)
      .next()
      .isDone();
  });

  it("should acknowledge immediately if not acknowledged but enabled", () => {
    testSaga(checkAcknowledgedFingerprintSaga)
      .next()
      .select(isFingerprintAcknowledgedSelector)
      .next(false)
      .select(isFingerprintEnabledSelector)
      .next(true)
      .put(fingerprintAcknowledged())
      .next()
      .isDone();
  });

  it("should call onboardFingerprintIfAvailableSaga if not acknowledged and not enabled", () => {
    testSaga(checkAcknowledgedFingerprintSaga)
      .next()
      .select(isFingerprintAcknowledgedSelector)
      .next(false)
      .select(isFingerprintEnabledSelector)
      .next(false)
      .call(testable!.onboardFingerprintIfAvailableSaga)
      .next()
      .isDone();
  });
});

describe("onboardFingerprintIfAvailableSaga", () => {
  it("should call handleBiometricAvailable if biometric is Available", () => {
    testSaga(testable!.onboardFingerprintIfAvailableSaga)
      .next()
      .put(fingerprintAcknowledged())
      .next()
      .call(getBometricState)
      .next("Available")
      .call(handleBiometricAvailable)
      .next()
      .isDone();
  });

  it("should call hanldeMissingDevicePin if biometric is not available and OS pin is not set", () => {
    testSaga(testable!.onboardFingerprintIfAvailableSaga)
      .next()
      .put(fingerprintAcknowledged())
      .next()
      .call(getBometricState)
      .next("Unavailable")
      .call(isScreenLockSet)
      .next(false)
      .call(hanldeMissingDevicePin)
      .next()
      .isDone();
  });

  it("should call hanldeBiometricNotEnrolled if biometric is NotEnrolled and OS pin is set", () => {
    testSaga(testable!.onboardFingerprintIfAvailableSaga)
      .next()
      .put(fingerprintAcknowledged())
      .next()
      .call(getBometricState)
      .next("NotEnrolled")
      .call(isScreenLockSet)
      .next(true)
      .call(hanldeBiometricNotEnrolled)
      .next()
      .isDone();
  });

  it("should call handleBiometricNotSupported if biometric is Unavailable and OS pin is set", () => {
    testSaga(testable!.onboardFingerprintIfAvailableSaga)
      .next()
      .put(fingerprintAcknowledged())
      .next()
      .call(getBometricState)
      .next("Unavailable")
      .call(isScreenLockSet)
      .next(true)
      .call(handleBiometricNotSupported)
      .next()
      .isDone();
  });
});
