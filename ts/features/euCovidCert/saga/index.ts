import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { euCovidCertificateGet } from "../store/actions";
import { BackendEuCovidCertClient } from "../api/backendEuCovidCert";
import { apiUrlPrefix } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { handleGetEuCovidCertificate } from "./networking/handleGetEuCovidCertificate";

/**
 * Handle the EU Covid Certificate requests
 * @param bearerToken
 */
export function* watchEUCovidCertificateSaga(
  bearerToken: SessionToken
): SagaIterator {
  const euCovidCertClient = BackendEuCovidCertClient(apiUrlPrefix, bearerToken);

  // handle the request of getting eu covid cert
  yield takeLatest(
    euCovidCertificateGet.request,
    handleGetEuCovidCertificate,
    euCovidCertClient.getCertificate
  );
}
