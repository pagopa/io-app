import { left } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { PasswordLogin } from "../../definitions/backend/PasswordLogin";
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
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);

  function postTestLogin(
    body: PasswordLogin
  ): Promise<t.Validation<BasicResponseType<SessionToken>>> {
    return new Promise((resolve, _) =>
      backendPublicClient
        .postTestLogin(body)
        .then(resolve, e => resolve(left([{ context: [], value: e }])))
    );
  }

  const testLoginResponse: SagaCallReturnType<
    typeof postTestLogin
  > = yield call(postTestLogin, payload);

  if (testLoginResponse.isRight() && testLoginResponse.value.status === 200) {
    yield put(loginSuccess(testLoginResponse.value.value));
  } else {
    yield put(loginFailure(new Error(testLoginResponse.value.toString())));
  }
}

export function* watchTestLoginRequestSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(testLoginRequest), handleTestLogin);
}
