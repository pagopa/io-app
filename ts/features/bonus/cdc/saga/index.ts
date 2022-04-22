import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { BackendCdcClient } from "../api/backendCdc";
import { apiUrlPrefix } from "../../../../config";
import { cdcRequestBonusList } from "../store/actions/cdcBonusRequest";
import { handleGetStatoBeneficiario } from "./networking/handleGetStatoBeneficiario";

/**
 *
 * Watch all events about cdc.
 * Note that, also if seems strange, for speed purpose is been decided to use the bpdBearerToken.
 *
 * @param bpdBearerToken
 */
export function* watchBonusCdcSaga(bpdBearerToken: string): SagaIterator {
  // Client for the Cdc
  const cdcClient: BackendCdcClient = BackendCdcClient(
    apiUrlPrefix,
    bpdBearerToken
  );

  // SV get the list of bonus per year with the associated status
  yield* takeLatest(
    cdcRequestBonusList.request,
    handleGetStatoBeneficiario,
    cdcClient.getStatoBeneficiario
  );
}
