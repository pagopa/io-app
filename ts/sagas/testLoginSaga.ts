import { left } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { AccessToken } from "../../definitions/backend/AccessToken";
import { PasswordLogin } from "../../definitions/backend/PasswordLogin";
import { BackendPublicClient } from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import {
  loginFailure,
  loginSuccess,
  testLoginRequest
} from "../store/actions/authentication";
import { SessionToken } from "../types/SessionToken";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { convertUnknownToError } from "../utils/errors";

// Started by redux action
function* handleTestLogin({
  payload
}: ActionType<typeof testLoginRequest>): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<typeof postTestLogin>
> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);

  function postTestLogin(
    login: PasswordLogin
  ): Promise<t.Validation<BasicResponseType<AccessToken>>> {
    return new Promise((resolve, _) =>
      backendPublicClient
        .postTestLogin(login)
        .then(resolve, e => resolve(left([{ context: [], value: e }])))
    );
  }
  try {
    const testLoginResponse: SagaCallReturnType<typeof postTestLogin> =
      yield* call(postTestLogin, payload);

    if (testLoginResponse.isRight()) {
      if (testLoginResponse.value.status === 200) {
        yield* put(
          loginSuccess({
            token: testLoginResponse.value.value
              .token as string as SessionToken,
            idp: "idp"
          })
        );
        return;
      }
      throw Error(`response status ${testLoginResponse.value.status}`);
    }
    throw new Error(readableReport(testLoginResponse.value));
  } catch (e) {
    yield* put(
      loginFailure({ error: convertUnknownToError(e), idp: "testIdp" })
    );
  }
}

export function* watchTestLoginRequestSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(testLoginRequest), handleTestLogin);
}
