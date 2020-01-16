/**
 * A saga to manage the load/refresh of visible services
 */
import { put, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { metadataServicesByScopeLoad } from "../../store/actions/content";
import {
  loadServiceDetail,
  loadVisibleServices
} from "../../store/actions/services";
import { loadServiceDetailRequestHandler } from "./loadServiceDetailRequestHandler";
import { loadVisibleServicesRequestHandler } from "./loadVisibleServicesHandler";

export function* watchLoadServicesSaga(
  backendClient: ReturnType<typeof BackendClient>
) {
  yield takeEvery(
    getType(loadServiceDetail.request),
    loadServiceDetailRequestHandler,
    backendClient.getService
  );

  yield takeEvery(
    getType(loadVisibleServices.request),
    loadVisibleServicesRequestHandler,
    backendClient.getVisibleServices
  );

  // Load/refresh services content
  yield put(loadVisibleServices.request());
  // Load/refresh refresh services scope list
  yield put(metadataServicesByScopeLoad.request());
}
