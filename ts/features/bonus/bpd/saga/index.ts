import { SagaIterator } from "redux-saga";
import { call, takeLatest, CallEffect } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { BackendBpdClient } from "../api/backendBpdClient";
import { apiUrlPrefix } from "../../../../config";
import { loadBpdActivationStatus } from "../store/actions/details";
import {
  BpdOnboardingAcceptDeclaration,
  BpdOnboardingStart,
  enrollToBpd
} from "../store/actions/onboarding";
import { getAsyncResult } from "../../../../utils/saga";
import { putEnrollCitizen, getCitizen } from "./networking";
import { handleBpdEnroll } from "./orchestration/onboarding/enrollToBpd";
import { handleBpdStartOnboardingSaga } from "./orchestration/onboarding/startOnboarding";

// watch all events about bpd
export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const bpdBackendClient = BackendBpdClient(apiUrlPrefix, bpdBearerToken);

  // load citizen details
  yield takeLatest(
    loadBpdActivationStatus.request,
    getCitizen,
    bpdBackendClient.find
  );

  // enroll citizen to the bpd
  yield takeLatest(
    enrollToBpd.request,
    putEnrollCitizen,
    bpdBackendClient.enrollCitizenIO
  );

  // First step of the onboarding workflow; check if the user is enrolled to the bpd program
  yield takeLatest(getType(BpdOnboardingStart), handleBpdStartOnboardingSaga);

  // The user accepts the declaration, enroll the user to the bpd program
  yield takeLatest(getType(BpdOnboardingAcceptDeclaration), handleBpdEnroll);
}

// try to enroll the citizen and return the operation outcome
// true -> successfully enrolled
export function* enrollCitizen(): Generator<CallEffect, boolean, boolean> {
  return yield call(() =>
    getAsyncResult(enrollToBpd, undefined as void, c => c.enabled)
  );
}
