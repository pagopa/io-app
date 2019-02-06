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
  // We check whether the user has already created a PIN by trying to retrieve
  // it from the Keychain
  const biometryTypeOrUnsupportedReason: BiometrySimpleType = yield call(
    getFingerprintSettings
  );

  if (biometryTypeOrUnsupportedReason !== "Unavailable") {
    yield put(
      navigateToOnboardingFingerprintScreenAction({
        biometryType: biometryTypeOrUnsupportedReason
      })
    );

    // Here we wait the user accept the ToS
    yield take(getType(fingerprintAcknowledge.request));

    // We're done with accepting the ToS, dispatch the action that updates
    // the redux state.
    yield put(fingerprintAcknowledge.success());
  }
}

const isSupportedConfig: IsSupportedConfig = {
  unifiedErrors: true
};

/**
 * Retrieves fingerpint settings from the base system
 */
async function getFingerprintSettings(): Promise<BiometrySimpleType> {
  return new Promise((resolve, _) => {
    TouchID.isSupported(isSupportedConfig)
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
