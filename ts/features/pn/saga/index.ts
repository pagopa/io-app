import { SagaIterator } from "redux-saga";
import { getType } from "typesafe-actions";
import { takeLatest } from "typed-redux-saga/macro";
import { loadPnContent } from "../store/actions";
import { BackendClient } from "../../../api/backend";
import { getPnMessageSaga } from "./networking/getPnMessageSaga";

/**
 * Handle the PN Requests
 * @param bearerToken
 */
export function* watchPnSaga(
  getThirdPartyMessage: ReturnType<typeof BackendClient>["getThirdPartyMessage"]
): SagaIterator {
  yield* takeLatest(
    getType(loadPnContent.request),
    getPnMessageSaga,
    getThirdPartyMessage
  );
}
