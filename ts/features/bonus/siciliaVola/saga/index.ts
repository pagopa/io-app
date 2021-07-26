import { call, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { SagaIterator } from "redux-saga";
import { none, some } from "fp-ts/lib/Option";
import { SessionManager } from "../../../../utils/SessionManager";
import { apiUrlPrefix } from "../../../../config";
import { svGenerateVoucherStart } from "../store/actions/voucherGeneration";
import { BackendSiciliaVolaClient } from "../api/backendSiciliaVola";
import { SessionToken } from "../../../../types/SessionToken";
import { handleSvVoucherGenerationStartActivationSaga } from "./orchestration/voucherGeneration";
import { MitVoucherToken } from "../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { SagaCallReturnType } from "../../../../types/utils";

export function* watchBonusSvSaga(sessionToken: SessionToken): SagaIterator {
  // Client for the Sicilia Vola
  const siciliaVolaClient: BackendSiciliaVolaClient = BackendSiciliaVolaClient(
    apiUrlPrefix,
    sessionToken
  );

  // Helper function that requests a new session token from the SiciliaVola.
  // When calling the Sv APIs, we must use separate session, generated from the
  // sessionToken.
  const getSiciliaVolaSessionToken = async () => {
    try {
      const response = await siciliaVolaClient.getMitVoucherToken(sessionToken);
      if (response.isRight() && response.value.status === 200) {
        return some(response.value.value);
      }
      return none;
    } catch {
      return none;
    }
  };
  // The session manager for SiciliaVola (Sv) will manage the
  // refreshing of the Sv session when calling its APIs, keeping a shared token
  // and serializing the refresh requests.
  const svSessionManager: SessionManager<MitVoucherToken> = new SessionManager(
    getSiciliaVolaSessionToken
  );

  // SV Activation workflow
  yield takeLatest(
    getType(svGenerateVoucherStart),
    handleSvVoucherGenerationStartActivationSaga
  );
}
