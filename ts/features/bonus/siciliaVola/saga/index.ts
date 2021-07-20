import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { SagaIterator } from "redux-saga";
import { svGenerateVoucherStart } from "../store/actions/voucherGeneration";
import { handleSvVoucherGenerationStartActivationSaga } from "./orchestration/voucherGeneration";
import { SessionManager } from "../../../../utils/SessionManager";
import { apiUrlPrefix } from "../../../../config";
import { none, some } from "fp-ts/lib/Option";
import { BackendSiciliaVolaClient } from "../api/backendSiciliaVola";
import { SessionToken } from "../../../../types/SessionToken";

export function* watchBonusSvSaga(sessionToken: SessionToken): SagaIterator {
  // Client for the Sicilia Vola
  const siciliaVolaClient: BackendSiciliaVolaClient = BackendSiciliaVolaClient(
    apiUrlPrefix,
    sessionToken
  );

  // Helper function that requests a new session token from the SiciliaVola.
  // When calling the Sv APIs, we must use separate session, generated from the
  // sessionToken.
  const getSiciliaVolaSession = async () => {
    try {
      const response = await siciliaVolaClient.GetMitVoucherToken(sessionToken);
      if (response.isRight() && response.value.status === 200) {
        return some(response.value.value.token);
      }
      return none;
    } catch {
      return none;
    }
  };
  // The session manager for SiciliaVola (Sv) will manage the
  // refreshing of the Sv session when calling its APIs, keeping a shared token
  // and serializing the refresh requests.
  const svSessionManager = new SessionManager(getSiciliaVolaSession);

  // SV Activation workflow
  yield takeLatest(
    getType(svGenerateVoucherStart),
    handleSvVoucherGenerationStartActivationSaga
  );
}
