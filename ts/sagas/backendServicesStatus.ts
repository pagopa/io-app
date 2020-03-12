/**
 * this saga checks at regular intervals the backend status
 */
import { Millisecond } from "italia-ts-commons/lib/units";
import { call, Effect, fork, put, select } from "redux-saga/effects";
import { BackendPublicClient } from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import { backendServicesStatusLoadSuccess } from "../store/actions/backendServicesStatus";
import { appStateSelector } from "../store/reducers/appState";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";
import { RTron } from "../boot/configureStoreAndPersistor";

const BACKEND_SERVICES_STATUS_LOAD_INTERVAL = 5000 as Millisecond;

export function* backendServicesStatusSaga(
  getServicesStatus: ReturnType<typeof BackendPublicClient>["getServicesStatus"]
): IterableIterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getServicesStatus> = yield call(
      getServicesStatus,
      {}
    );
    if (response.isRight() && response.value.status === 200) {
      yield put(backendServicesStatusLoadSuccess(response.value.value));
    }
  } catch (e) {
    // do nothing. it should be a network or decoding error
  }
}

/**
 * this saga requests and checks in loop backend services status
 * if some of them is critical app could show a warning message or avoid
 * the whole usage
 */
export function* backendServicesStatusWatcherLoop(
  getServicesStatus: ReturnType<typeof BackendPublicClient>["getServicesStatus"]
): IterableIterator<Effect> {
  // check backend status periodically
  while (true) {
    try {
      const start = new Date();
      const appCurrentState: ReturnType<typeof appStateSelector> = yield select(
        appStateSelector
      );
      const end = new Date();
      console.warn(end.getTime() - start.getTime());
      // do it only when the app is foreground
      if (appCurrentState.appState === "active") {
        yield call(backendServicesStatusSaga, getServicesStatus);
      }
      yield call(startTimer, BACKEND_SERVICES_STATUS_LOAD_INTERVAL);
    } catch (_) {
      continue;
    }
  }
}

export default function* root(): IterableIterator<Effect> {
  console.warn("EXEC");
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);
  yield fork(
    backendServicesStatusWatcherLoop,
    backendPublicClient.getServicesStatus
  );
}
