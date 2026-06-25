import { call, takeLatest } from "typed-redux-saga/macro";

import { apiUrlPrefix } from "../../../../config";
import { createFimsClient } from "../api/client";
import { fimsHistoryExport, fimsHistoryGet } from "../store/actions";
import { handleExportFimsHistorySaga } from "./handleExportFimsHistorySaga";
import { handleGetFimsHistorySaga } from "./handleGetFimsHistorySaga";

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
