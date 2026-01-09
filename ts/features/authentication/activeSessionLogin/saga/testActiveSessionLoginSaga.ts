import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { BasicResponseType } from "@pagopa/ts-commons/lib/requests";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { AccessToken } from "../../../../../definitions/session_manager/AccessToken";
import { PasswordLogin } from "../../../../../definitions/session_manager/PasswordLogin";
import { BackendPublicClient } from "../../../../api/backendPublic";
import { apiUrlPrefix } from "../../../../config";
import {
  testActiveSessionLoginRequest,
  activeSessionLoginSuccess,
  activeSessionLoginFailure
} from "../store/actions";
import { SessionToken } from "../../../../types/SessionToken";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { ephemeralPublicKeySelector } from "../../../lollipop/store/reducers/lollipop";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../../../lollipop/utils/login";
import { isActiveSessionFastLoginEnabledSelector } from "../store/selectors";
import { hashedProfileFiscalCodeSelector } from "../../../../store/reducers/crossSessions";

// Started by redux action
export function* handleTestActiveSessionLogin({
  payload
}: ActionType<typeof testActiveSessionLoginRequest>): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<typeof postTestLogin>
> {
  const backendPublicClient = BackendPublicClient(apiUrlPrefix);
  const maybeEphemeralPublicKey = yield* select(ephemeralPublicKeySelector);
  const isActiveSessionFastLogin = yield* select(
    isActiveSessionFastLoginEnabledSelector
  );
  const isFL = maybeEphemeralPublicKey ? isActiveSessionFastLogin : undefined;
  const hashedFiscalCode = yield* select(hashedProfileFiscalCodeSelector);

  function postTestLogin(
    login: PasswordLogin,
    publicKey?: PublicKey,
    hashAlgorithm?: string,
    isFastLogin?: boolean,
    hashedFiscalCodeParam?: string
  ): Promise<t.Validation<BasicResponseType<AccessToken>>> {
    return new Promise((resolve, _) =>
      backendPublicClient
        .postTestLogin(
          publicKey,
          hashAlgorithm,
          isFastLogin,
          hashedFiscalCodeParam
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
        isFL,
        hashedFiscalCode
      );

    if (E.isRight(testLoginResponse)) {
      if (testLoginResponse.right.status === 200) {
        yield* put(
          activeSessionLoginSuccess(
            testLoginResponse.right.value.token as string as SessionToken
          )
        );
        return;
      }
      yield* put(activeSessionLoginFailure());
      return;
    }
    yield* put(activeSessionLoginFailure());
  } catch (e) {
    yield* put(activeSessionLoginFailure());
  }
}

export function* watchTestActiveSessionLoginRequestSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(
    getType(testActiveSessionLoginRequest),
    handleTestActiveSessionLogin
  );
}
