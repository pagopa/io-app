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
  loginFailure,
  loginSuccess,
  testLoginRequest
} from "../store/actions/authentication";
import { SessionToken } from "../types/SessionToken";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { convertUnknownToError } from "../utils/errors";
import {
  IdentityProvider,
  IdentityProviderId
} from "../models/IdentityProvider";

export const TestIdpId = "testIdp";
export const TestIdp: IdentityProvider = {
  id: TestIdpId as IdentityProviderId,
  name: "Test Idp",
  logo: "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid.png",
  entityID: TestIdpId,
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
        yield* put(
          loginSuccess({
            token: testLoginResponse.right.value
              .token as string as SessionToken,
            idp: TestIdpId
          })
        );
        return;
      }
      throw Error(`response status ${testLoginResponse.right.status}`);
    }
    throw new Error(readableReport(testLoginResponse.left));
  } catch (e) {
    yield* put(
      loginFailure({ error: convertUnknownToError(e), idp: TestIdpId })
    );
  }
}

export function* watchTestLoginRequestSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(testLoginRequest), handleTestLogin);
}
