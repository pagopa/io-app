import { takeLatest } from "typed-redux-saga/macro";
import { FimsHistoryClient } from "../api/client";
import { fimsHistoryExport, fimsHistoryGet } from "../store/actions";
import { handleGetFimsHistorySaga } from "./handleGetFimsHistorySaga";
import { handleExportFimsHistorySaga } from "./handleExportFimsHistorySaga";

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
  yield* takeLatest(
    fimsHistoryExport.request,
    handleExportFimsHistorySaga,
    client.exports,
    bearerToken
  );
}
