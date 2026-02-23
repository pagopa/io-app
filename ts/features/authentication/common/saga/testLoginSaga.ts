import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { BasicResponseType } from "@pagopa/ts-commons/lib/requests";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { AccessToken } from "../../../../../definitions/session_manager/AccessToken";
import { PasswordLogin } from "../../../../../definitions/session_manager/PasswordLogin";
import { BackendPublicClient } from "../../../../api/backendPublic";
import { apiUrlPrefix } from "../../../../config";
import { loginFailure, loginSuccess, testLoginRequest } from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { IdpData } from "../../../../../definitions/content/IdpData";
import { isFastLoginEnabledSelector } from "../../fastLogin/store/selectors";
import { ephemeralPublicKeySelector } from "../../../lollipop/store/reducers/lollipop";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../../../lollipop/utils/login";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector
} from "../../activeSessionLogin/store/selectors";

// Started by redux action
export function* handleTestLogin({
  payload
}: ActionType<typeof testLoginRequest>): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<typeof postTestLogin>
> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);
  const isFastLoginSelected = yield* select(isFastLoginEnabledSelector);
  const maybeEphemeralPublicKey = yield* select(ephemeralPublicKeySelector);
  const isActiveSessionFastLogin = yield* select(
    isActiveSessionFastLoginEnabledSelector
  );
  const isActiveSessionLogin = yield* select(isActiveSessionLoginSelector);
  const isFL = maybeEphemeralPublicKey
    ? isActiveSessionLogin
      ? isActiveSessionFastLogin
      : isFastLoginSelected
    : undefined;
  function postTestLogin(
    login: PasswordLogin,
    publicKey?: PublicKey,
    hashAlgorithm?: string,
    isFastLogin?: boolean
  ): Promise<t.Validation<BasicResponseType<AccessToken>>> {
    return new Promise((resolve, _) =>
      backendPublicClient
        .postTestLogin(
          publicKey,
          hashAlgorithm,
          isFastLogin
        )(login)
        .then(resolve, e => resolve(E.left([{ context: [], value: e }])))
    );
  }
  try {
    const testLoginResponse: SagaCallReturnType<typeof postTestLogin> =
      yield* call(
        postTestLogin,
        payload,
        maybeEphemeralPublicKey,
        maybeEphemeralPublicKey
          ? DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER
          : undefined,
        isFL
      );

    if (E.isRight(testLoginResponse)) {
      if (testLoginResponse.right.status === 200) {
        yield* put(
          loginSuccess({
            token: testLoginResponse.right.value.token,
            idp: "test" as keyof IdpData
          })
        );
        return;
      }
      yield* put(
        loginFailure({
          error: new Error(`response status ${testLoginResponse.right.status}`),
          idp: "test" as keyof IdpData
        })
      );
      return;
    }
    yield* put(
      loginFailure({
        error: new Error(
          (readableReport(testLoginResponse.left).match(/"status":\d{3}/) ?? [
            "unknown error"
          ])[0]
        ),
        idp: "test" as keyof IdpData
      })
    );
  } catch (e) {
    yield* put(
      loginFailure({
        error: convertUnknownToError(e),
        idp: "test" as keyof IdpData
      })
    );
  }
}

export function* watchTestLoginRequestSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(testLoginRequest), handleTestLogin);
}
