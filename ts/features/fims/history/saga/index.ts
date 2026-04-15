import { call, takeLatest } from "typed-redux-saga/macro";
import { createFimsClient } from "../api/client";
import { fimsHistoryExport, fimsHistoryGet } from "../store/actions";
import { apiUrlPrefix } from "../../../../config";
import { handleGetFimsHistorySaga } from "./handleGetFimsHistorySaga";
import { handleExportFimsHistorySaga } from "./handleExportFimsHistorySaga";

export function* watchFimsHistorySaga(bearerToken: string) {
  const client = yield* call(createFimsClient, apiUrlPrefix);
  yield* takeLatest(
    fimsHistoryGet.request,
    handleGetFimsHistorySaga,
    client.getAccessHistory,
    bearerToken
  );
  yield* takeLatest(
    fimsHistoryExport.request,
    handleExportFimsHistorySaga,
    client.requestExport,
    bearerToken
  );
}
