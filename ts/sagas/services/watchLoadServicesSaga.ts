import { SagaIterator } from "redux-saga";
import { fork, put, takeEvery, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import {
  loadServiceDetail,
  loadVisibleServices
} from "../../store/actions/services";
import {
  loadServiceDetailRequestHandler,
  watchServicesDetailLoadSaga
} from "../startup/loadServiceDetailRequestHandler";
import { loadVisibleServicesRequestHandler } from "../startup/loadVisibleServicesHandler";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../store/actions/services/servicePreference";
import { servicesRedesignEnabled } from "../../config";
import { handleFirstVisibleServiceLoadSaga } from "./handleFirstVisibleServiceLoadSaga";
import { handleGetServicePreference } from "./servicePreference/handleGetServicePreferenceSaga";
import { handleUpsertServicePreference } from "./servicePreference/handleUpsertServicePreferenceSaga";

/**
 * A saga for managing requests to load/refresh services data from backend
 * @param backendClient
 */
export function* watchLoadServicesSaga(
  backendClient: ReturnType<typeof BackendClient>
): SagaIterator {
  yield takeEvery(
    getType(loadVisibleServices.request),
    loadVisibleServicesRequestHandler,
    backendClient.getVisibleServices
  );

  // handle the single load service request
  yield takeEvery(
    getType(loadServiceDetail.request),
    loadServiceDetailRequestHandler,
    backendClient.getService
  );

  if (servicesRedesignEnabled) {
    // handle the load of service preference request
    // TODO Add backend client when defined
    yield takeLatest(
      getType(loadServicePreference.request),
      handleGetServicePreference
    );

    // handle the upsert request for the current service
    // TODO Add backend client when defined
    yield takeLatest(
      getType(upsertServicePreference.request),
      handleUpsertServicePreference
    );
  }

  // start a watcher to handle the load of services details in a bunch (i.e when visible services are loaded)
  yield fork(watchServicesDetailLoadSaga, backendClient.getService);

  // TODO: it could be implemented in a forked saga being canceled as soon as
  // isFirstServiceLoadCOmpleted is true (https://redux-saga.js.org/docs/advanced/TaskCancellation.html)
  yield takeEvery(
    getType(loadServiceDetail.success),
    handleFirstVisibleServiceLoadSaga
  );

  // Load/refresh services content
  yield put(loadVisibleServices.request());
}
