import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaIterator } from "redux-saga";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import {
  checkCurrentSession,
  sessionExpired
} from "../../store/actions/authentication";
import { loadSessionInformationSaga } from "./loadSessionInformationSaga";

export function* checkSessionResult(
  action: ReturnType<typeof checkCurrentSession["success"]>
) {
  if (!action.payload.isSessionValid) {
    yield put(sessionExpired());
  }
}

// Saga that listen to check session dispatch and returns it's validity
export function* watchCheckSessionSaga(
  getSessionValidity: ReturnType<typeof BackendClient>["getSession"]
): SagaIterator {
  yield takeLatest(
    getType(checkCurrentSession.request),
    loadSessionInformationSaga,
    getSessionValidity
  );
  yield takeLatest(getType(checkCurrentSession.success), checkSessionResult);
}
