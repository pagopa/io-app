/**
 * this saga checks at regular intervals the backend status
 */
import { Millisecond } from "italia-ts-commons/lib/units";
import { AppState } from "react-native";
import { call, Effect, fork, put, select } from "redux-saga/effects";
import { BackendPublicClient } from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import { backendServicesStatusLoadSuccess } from "../store/actions/backendStatus";
import { backendServicesStatusSelector } from "../store/reducers/backendServicesStatus";
import { SagaCallReturnType } from "../types/utils";
import { startTimer } from "../utils/timer";

const BACKEND_SERVICES_STATUS_LOAD_INTERVAL = (10 * 1000) as Millisecond;
const BACKEND_SERVICES_STATUS_FAILURE_INTERVAL = (2 * 1000) as Millisecond;

export function* backendStatusSaga(
  getServicesStatus: ReturnType<typeof BackendPublicClient>["getStatus"]
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
export function* backendStatusWatcherLoop(
  getStatus: ReturnType<typeof BackendPublicClient>["getStatus"]
): IterableIterator<Effect> {
  // check backend status periodically
  // do it only when the app is foreground
  while (true) {
    if (AppState.currentState === "active") {
      yield call(backendStatusSaga, getStatus);
    }
    const currentState: ReturnType<
      typeof backendServicesStatusSelector
    > = yield select(backendServicesStatusSelector);
    // if counter of dead > 0 we change the sleep timeout (more frequent when dead is detected)
    const sleepTime =
      currentState.deadsCounter > 0 && currentState.areSystemsDead === false
        ? BACKEND_SERVICES_STATUS_FAILURE_INTERVAL
        : BACKEND_SERVICES_STATUS_LOAD_INTERVAL;
    yield call(startTimer, sleepTime);
  }
}

export default function* root(): IterableIterator<Effect> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);
  yield fork(backendStatusWatcherLoop, backendPublicClient.getStatus);
}
