import { SagaIterator } from "redux-saga";
import { take, takeLatest, put } from "redux-saga/effects";
import { BackendBdpClient } from "../api/backendBdpClient";
import { apiUrlPrefix } from "../../../../config";
import { loadBdpActivationStatus } from "../store/actions/details";
import { enrollToBpd } from "../store/actions/onboarding";
import { enrollCitizen, findCitizen } from "./networking";
import { getType } from "typesafe-actions";

// watch all events about bdp
export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const bdpBackendClient = BackendBdpClient(apiUrlPrefix, bpdBearerToken);

  // load citizen details
  yield takeLatest(
    loadBdpActivationStatus.request,
    findCitizen,
    bdpBackendClient.find
  );

  // enroll citizen to the bdp
  yield takeLatest(
    enrollToBpd.request,
    enrollCitizen,
    bdpBackendClient.enrollCitizenIO
  );
}

export function* getEnrollCitizen() {
  yield put(enrollToBpd.request());
  const result: typeof enrollToBpd = yield take([
    getType(enrollToBpd.success),
    getType(enrollToBpd.failure)
  ]);
}
