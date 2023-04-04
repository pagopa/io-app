import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { BasicResponseType } from "@pagopa/ts-commons/lib/requests";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { AccessToken } from "../../definitions/backend/AccessToken";
import { PasswordLogin } from "../../definitions/backend/PasswordLogin";
import { BackendPublicClient } from "../api/backendPublic";
import { apiUrlPrefix } from "../config";
import {
  idpSelected,
  loginFailure,
  loginSuccess,
  testLoginRequest
} from "../store/actions/authentication";
import { SessionToken } from "../types/SessionToken";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { convertUnknownToError } from "../utils/errors";
import { IdentityProvider } from "../models/IdentityProvider";

const IdpTest: IdentityProvider = {
  id: "test",
  name: "Test Idp",
  logo: "",
  entityID: "testIdp",
  profileUrl: "",
  isTestIdp: true
};

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
        .then(resolve, e => resolve(E.left([{ context: [], value: e }])))
    );
  }
  try {
    const testLoginResponse: SagaCallReturnType<typeof postTestLogin> =
      yield* call(postTestLogin, payload);

    if (E.isRight(testLoginResponse)) {
      if (testLoginResponse.right.status === 200) {
        yield* put(idpSelected(IdpTest));
        yield* put(
          loginSuccess({
            token: testLoginResponse.right.value
              .token as string as SessionToken,
            idp: "idp"
          })
        );
        return;
      }
      throw Error(`response status ${testLoginResponse.right.status}`);
    }
    throw new Error(readableReport(testLoginResponse.left));
  } catch (e) {
    yield* put(
      loginFailure({ error: convertUnknownToError(e), idp: "testIdp" })
    );
  }
}

export function* watchTestLoginRequestSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(testLoginRequest), handleTestLogin);
}
