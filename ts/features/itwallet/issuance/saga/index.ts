import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { itwIssuanceEid } from "../store/actions/eid";
import { handleItwIssuanceEidSaga } from "./handleItwIssuanceEidSaga";

export function* watchItwIssuanceSaga(): SagaIterator {
  yield* takeLatest(itwIssuanceEid.request, handleItwIssuanceEidSaga);
}
