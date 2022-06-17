import { SagaIterator } from "redux-saga";
import { getType } from "typesafe-actions";
import { takeLatest } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { BackendPN } from "../api/backendPn";
import { loadPnContent } from "../store/actions";
import { getPnMessageSaga } from "./networking/getPnMessageSaga";

/**
 * Handle the PN Requests
 * @param bearerToken
 */
export function* watchPnSaga(bearerToken: SessionToken): SagaIterator {
  const backendPN = BackendPN(apiUrlPrefix, bearerToken);

  yield* takeLatest(
    getType(loadPnContent.request),
    getPnMessageSaga,
    backendPN.getThirdPartyMessage
  );
}
