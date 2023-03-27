import { call, cancel, fork, put, take } from "typed-redux-saga/macro";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../store/actions/analytics";
import { loginSuccess } from "../../store/actions/authentication";
import { startupLoadSuccess } from "../../store/actions/startup";
import { SessionToken } from "../../types/SessionToken";
import { ReduxSagaEffect } from "../../types/utils";
import { StartupStatusEnum } from "../../store/reducers/startup";
import { stopCieManager, watchCieAuthenticationSaga } from "../cie";
import { watchTestLoginRequestSaga } from "../testLoginSaga";

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* authenticationSaga(): Generator<
  ReduxSagaEffect,
  SessionToken,
  any
> {
  yield* put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED));
  yield* put(analyticsAuthenticationStarted());

  // Watch for the test login
  const watchTestLogin = yield* fork(watchTestLoginRequestSaga);
  // Watch for login by CIE
  const watchCieAuthentication = yield* fork(watchCieAuthenticationSaga);

  // Reset the navigation stack and navigate to the authentication screen
  // yield* call(resetToAuthenticationRoute);

  // Wait until the user has successfully logged in with SPID
  // FIXME: show an error on LOGIN_FAILED?
  const action = yield* take(loginSuccess);

  yield* cancel(watchCieAuthentication);
  yield* cancel(watchTestLogin);

  // stop cie manager from listening nfc
  yield* call(stopCieManager);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield* put(analyticsAuthenticationCompleted());

  return action.payload.token;
}
