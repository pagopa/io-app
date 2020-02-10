import { SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { loadVisibleServicesByScope } from "../../store/actions/content";
import {
  loadServiceDetail,
  loadVisibleServices
} from "../../store/actions/services";
import { loadServiceDetailRequestHandler } from "../startup/loadServiceDetailRequestHandler";
import { loadVisibleServicesRequestHandler } from "../startup/loadVisibleServicesHandler";
import { handleFirstVisibleServiceLoadSaga } from "./handleFirstVisibleServiceLoadSaga";

/**
 * A saga for managing requests to load/refresh services data from backend
 * @param backendClient
 */
export function* watchLoadServicesSaga(
  backendClient: ReturnType<typeof BackendClient>
): SagaIterator {
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

  // TODO: it could be implemented in a forked saga being canceled as soon as
  // isFirstServiceLoadCOmpleted is true (https://redux-saga.js.org/docs/advanced/TaskCancellation.html)
  // https://www.pivotaltracker.com/story/show/170770471
  yield takeEvery(
    [
      getType(loadServiceDetail.success),
      getType(loadVisibleServicesByScope.success)
    ],
    handleFirstVisibleServiceLoadSaga
  );

  // Load/refresh services content
  yield put(loadVisibleServices.request());
  // Load/refresh refresh services scope list
  yield put(loadVisibleServicesByScope.request());
}
