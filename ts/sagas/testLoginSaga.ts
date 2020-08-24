import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { BackendPublicClient } from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import {
  loginFailure,
  loginSuccess,
  testLoginRequest
} from "../store/actions/authentication";
import { SessionToken } from "../types/SessionToken";
import { SagaCallReturnType } from "../types/utils";

// Started by redux action
function* handleTestLogin({
  payload
}: ActionType<typeof testLoginRequest>): IterableIterator<Effect> {
  try {
    const backendPublicClient = BackendPublicClient(apiUrlPrefix);

    const testLoginResponse: SagaCallReturnType<
      typeof backendPublicClient.postTestLogin
    > = yield call(backendPublicClient.postTestLogin, payload);

    if (testLoginResponse.isRight()) {
      if (testLoginResponse.value.status === 200) {
        yield put(loginSuccess(testLoginResponse.value.value as SessionToken));
        return;
      }
      throw Error(`response status ${testLoginResponse.value.status}`);
    }
    throw new Error(readableReport(testLoginResponse.value));
  } catch (e) {
    yield put(loginFailure(e));
  }
}

export function* watchTestLoginRequestSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(testLoginRequest), handleTestLogin);
}
