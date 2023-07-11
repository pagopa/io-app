import { call, cancel, fork, take } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../types/utils";
import { SessionToken } from "../../../types/SessionToken";
import { loginSuccess } from "../store/actions/cie";
import { stopCieManager, watchCieAuthenticationSaga } from "./cie";

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* authenticationSaga(): Generator<
  ReduxSagaEffect,
  SessionToken,
  any
> {
  // Watch for login by CIE
  const watchCieAuthentication = yield* fork(watchCieAuthenticationSaga);

  // Wait until the user has successfully authenticated with CIE
  // FIXME: show an error on LOGIN_FAILED?
  const action = yield* take(loginSuccess);

  yield* cancel(watchCieAuthentication);

  // stop cie manager from listening nfc
  yield* call(stopCieManager);

  return action.payload.token;
}
