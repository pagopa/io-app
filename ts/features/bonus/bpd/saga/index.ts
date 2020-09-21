// Saga that listen to all bonus requests
import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BpdOnboardingStart } from "../store/actions/onboarding";
import { handleBpdOnboardingSaga } from "./orchestration/onboarding";

export function* watchBpdSaga(): SagaIterator {
  // handle onboarding flow
  yield takeLatest(getType(BpdOnboardingStart), handleBpdOnboardingSaga);
}
