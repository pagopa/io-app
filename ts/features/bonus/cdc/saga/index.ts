import { SagaIterator } from "redux-saga";
import { BackendCdcClient } from "../api/backendCdc";
import { apiUrlPrefix } from "../../../../config";

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
}
