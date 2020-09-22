import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { BackendBdpClient } from "../api/backendBdpClient";
import { apiUrlPrefix } from "../../../../config";
import { loadBdpActivationStatus } from "../store/actions/details";
import { enrollToBpd } from "../store/actions/onboarding";
import { handleFindCitizen } from "./handleCitizedFind";
import { handleEnrollCitizen } from "./handleCitizenEnroll";

export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  const bdpBackendClient = BackendBdpClient(apiUrlPrefix, bpdBearerToken);

  yield takeLatest(
    loadBdpActivationStatus.request,
    handleFindCitizen,
    bdpBackendClient.find
  );

  yield takeLatest(
    enrollToBpd.request,
    handleEnrollCitizen,
    bdpBackendClient.enrollCitizenIO
  );
}
