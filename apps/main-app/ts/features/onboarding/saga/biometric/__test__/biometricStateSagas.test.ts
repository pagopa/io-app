import { testSaga } from "redux-saga-test-plan";

import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../../../store/actions/persistedPreferences";
import {
  handleBiometricAvailable,
  handleBiometricNotSupported,
  hanldeBiometricNotEnrolled,
  hanldeMissingDevicePin
} from "../biometricStateSagas";

describe("biometricStateSagas", () => {
  it("should handleBiometricAvailable", () => {
    testSaga(handleBiometricAvailable)
      .next()
      .next() // skip call(buildBiometricNavigator(...))
      .take(preferenceFingerprintIsEnabledSaveSuccess)
      .next()
      .next() // skip call(removeBiometricScreen)
      .next()
      .isDone();
  });

  it("should hanldeMissingDevicePin", () => {
    testSaga(hanldeMissingDevicePin)
      .next()
      .next()
      .take(preferenceFingerprintIsEnabledSaveSuccess)
      .next()
      .next()
      .next()
      .isDone();
  });

  it("should hanldeBiometricNotEnrolled", () => {
    testSaga(hanldeBiometricNotEnrolled)
      .next()
      .next()
      .take(preferenceFingerprintIsEnabledSaveSuccess)
      .next()
      .next()
      .next()
      .isDone();
  });

  it("should handleBiometricNotSupported", () => {
    testSaga(handleBiometricNotSupported)
      .next()
      .put(
        preferenceFingerprintIsEnabledSaveSuccess({
          isFingerprintEnabled: false
        })
      )
      .next()
      .isDone();
  });
});
