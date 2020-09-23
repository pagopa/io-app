import { SagaIterator } from "redux-saga";
import {
  take,
  takeLatest,
  put,
  PutEffect,
  TakeEffect
} from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { BackendBdpClient } from "../api/backendBdpClient";
import { apiUrlPrefix } from "../../../../config";
import { loadBdpActivationStatus } from "../store/actions/details";
import { enrollToBpd } from "../store/actions/onboarding";
import { putEnrollCitizen, getCitizen } from "./networking";

// watch all events about bdp
export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const bdpBackendClient = BackendBdpClient(apiUrlPrefix, bpdBearerToken);

  // load citizen details
  yield takeLatest(
    loadBdpActivationStatus.request,
    getCitizen,
    bdpBackendClient.find
  );

  // enroll citizen to the bdp
  yield takeLatest(
    enrollToBpd.request,
    putEnrollCitizen,
    bdpBackendClient.enrollCitizenIO
  );
}

// try to enroll the citizen and return the operation outcome
// true -> successfully enrolled
export function* enrollCitizen(): Generator<
  PutEffect | TakeEffect,
  boolean,
  ActionType<typeof enrollToBpd>
> {
  yield put(enrollToBpd.request());
  const successType = getType(enrollToBpd.success);
  const failureType = getType(enrollToBpd.failure);
  const result: ActionType<typeof enrollToBpd> = yield take([
    successType,
    failureType
  ]);
  if (result.type === successType) {
    return result.payload.enabled;
  }
  return false;
}
