// Saga that listen to all bonus requests
import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import {
  BpdOnboardingAcceptDeclaration,
  BpdOnboardingStart
} from "../store/actions/onboarding";
import { handleBpdCheckActiveSaga } from "./orchestration/onboarding/checkBpdActive";
import { handleBpdEnroll } from "./orchestration/onboarding/enrollToBpd";

export function* watchBpdSaga(): SagaIterator {
  // First step of the onboarding workflow; check if the user is enrolled to the bpd program
  yield takeLatest(getType(BpdOnboardingStart), handleBpdCheckActiveSaga);

  // The user accepts the declaration, enroll the user to the bpd program
  yield takeLatest(getType(BpdOnboardingAcceptDeclaration), handleBpdEnroll);
}
