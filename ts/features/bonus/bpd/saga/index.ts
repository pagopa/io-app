import { SagaIterator } from "redux-saga";
import { call, takeLatest, CallEffect } from "redux-saga/effects";

import { BackendBpdClient } from "../api/backendBdpClient";
import { apiUrlPrefix } from "../../../../config";
import { loadBdpActivationStatus } from "../store/actions/details";
import { enrollToBpd } from "../store/actions/onboarding";
import { getAsyncResult } from "../../../../utils/saga";
import { putEnrollCitizen, getCitizen } from "./networking";

// watch all events about bdp
export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const bpdBackendClient = BackendBpdClient(apiUrlPrefix, bpdBearerToken);

  // load citizen details
  yield takeLatest(
    loadBdpActivationStatus.request,
    getCitizen,
    bpdBackendClient.find
  );

  // enroll citizen to the bdp
  yield takeLatest(
    enrollToBpd.request,
    putEnrollCitizen,
    bpdBackendClient.enrollCitizenIO
  );
}

// try to enroll the citizen and return the operation outcome
// true -> successfully enrolled
export function* enrollCitizen(): Generator<CallEffect, boolean, boolean> {
  return yield call(() =>
    getAsyncResult(enrollToBpd, undefined as void, c => c.enabled)
  );
}
