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
  const biometryTypeOrUnsupportedReason: BiometrySimpleType = yield call(
    getFingerprintSettings
  );

  if (biometryTypeOrUnsupportedReason !== "Unavailable") {
    yield put(
      navigateToOnboardingFingerprintScreenAction({
        biometryType: biometryTypeOrUnsupportedReason
      })
    );

    yield take(getType(fingerprintAcknowledge.request));

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
