/**
 * A saga to manage the load/refresh of visible services
 */
import { put, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { contentServicesByScopeLoad } from "../../store/actions/content";
import { loadService, loadVisibleServices } from "../../store/actions/services";
import { loadServiceDetailRequestHandler } from "../startup/loadServiceDetailRequestHandler";
import { loadVisibleServicesRequestHandler } from "../startup/loadVisibleServicesHandler";
import { handleFirstVisibleServiceLoadSaga } from "./handleFirstVisibleServiceLoadSaga";

/**
 * A saga for managing requests to load/refresh services data from backend
 * @param backendClient
 */
export function* watchLoadServicesSaga(
  backendClient: ReturnType<typeof BackendClient>
) {
  yield takeEvery(
    getType(loadService.request),
    loadServiceDetailRequestHandler,
    backendClient.getService
  );

  yield takeEvery(
    getType(loadVisibleServices.request),
    loadVisibleServicesRequestHandler,
    backendClient.getVisibleServices
  );

  yield takeEvery(
    [getType(loadService.success), getType(contentServicesByScopeLoad.success)],
    handleFirstVisibleServiceLoadSaga
  );

  // Load/refresh services content
  yield put(loadVisibleServices.request());
  // Load/refresh refresh services scope list
  yield put(contentServicesByScopeLoad.request());
}
