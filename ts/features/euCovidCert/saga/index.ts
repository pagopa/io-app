// watch all events about bpd
import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { euCovidCertificateGet } from "../store/actions";
import { handleGetEuCovidCertificate } from "./networking/handleGetEuCovidCertificate";

/**
 * Handle the EU Covid Certificate requests
 * @param _
 */
export function* watchEUCovidCertificateSaga(_: string): SagaIterator {
  // const euCovidCertClient = BackendBpdClient(bpdApiUrlPrefix, bpdBearerToken);

  yield takeLatest(euCovidCertificateGet.request, handleGetEuCovidCertificate);
}
