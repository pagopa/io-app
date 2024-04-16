import { SagaIterator } from "redux-saga";
import { fork, put, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { handleGetServicePreference } from "../../features/services/saga/handleGetServicePreference";
import { handleUpsertServicePreference } from "../../features/services/saga/handleUpsertServicePreference";
import {
  loadServiceDetail,
  loadVisibleServices
} from "../../store/actions/services";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../features/services/store/actions";
import {
  loadServiceDetailRequestHandler,
  watchServicesDetailLoadSaga
} from "../startup/loadServiceDetailRequestHandler";
import { loadVisibleServicesRequestHandler } from "../startup/loadVisibleServicesHandler";
import { handleFirstVisibleServiceLoadSaga } from "./handleFirstVisibleServiceLoadSaga";

/**
 * A saga for managing requests to load/refresh services data from backend
 * @param backendClient
 */
export function* watchLoadServicesSaga(
  backendClient: ReturnType<typeof BackendClient>
): SagaIterator {
  yield* takeEvery(
    getType(loadVisibleServices.request),
    loadVisibleServicesRequestHandler,
    backendClient.getVisibleServices
  );

  // handle the single load service request
  yield* takeEvery(
    getType(loadServiceDetail.request),
    loadServiceDetailRequestHandler,
    backendClient.getService
  );

  // handle the load of service preference request
  yield* takeLatest(
    getType(loadServicePreference.request),
    handleGetServicePreference,
    backendClient.getServicePreference
  );

  // handle the upsert request for the current service
  yield* takeLatest(
    getType(upsertServicePreference.request),
    handleUpsertServicePreference,
    backendClient.upsertServicePreference
  );

  // start a watcher to handle the load of services details in a bunch (i.e when visible services are loaded)
  yield* fork(watchServicesDetailLoadSaga, backendClient.getService);

  // TODO: it could be implemented in a forked saga being canceled as soon as
  // isFirstServiceLoadCOmpleted is true (https://redux-saga.js.org/docs/advanced/TaskCancellation.html)
  yield* takeEvery(
    getType(loadServiceDetail.success),
    handleFirstVisibleServiceLoadSaga
  );

  // Load/refresh services content
  yield* put(loadVisibleServices.request());
}
