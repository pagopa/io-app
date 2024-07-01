import { takeLatest } from "typed-redux-saga/macro";
import { FimsHistoryClient } from "../api/client";
import { fimsHistoryGet } from "../store/actions";
import { handleGetFimsHistorySaga } from "./handleGetFimsHistorySaga";

export function* watchFimsHistorySaga(
  client: FimsHistoryClient,
  bearerToken: string
) {
  yield* takeLatest(
    fimsHistoryGet.request,
    handleGetFimsHistorySaga,
    client.getConsents,
    bearerToken
  );
}
