import { SagaIterator } from "redux-saga";
import { getType } from "typesafe-actions";
import { takeLatest } from "typed-redux-saga/macro";
import { BackendClient } from "../../../api/backend";
import { loadThirdPartyMessage } from "../../messages/store/actions";
import { getPnMessageSaga } from "./networking/getPnMessageSaga";

/**
 * Handle the PN Requests
 * @param bearerToken
 */
export function* watchPnSaga(
  getThirdPartyMessage: ReturnType<typeof BackendClient>["getThirdPartyMessage"]
): SagaIterator {
  yield* takeLatest(
    getType(loadThirdPartyMessage.request),
    getPnMessageSaga,
    getThirdPartyMessage
  );
}
