import * as O from "fp-ts/lib/Option";
import { call, cancel, fork, put, select, take } from "typed-redux-saga/macro";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../store/actions/analytics";
import { loginSuccess } from "../../features/authentication/store/actions";
import { startupLoadSuccess } from "../../store/actions/startup";
import { SessionToken } from "../../types/SessionToken";
import { ReduxSagaEffect } from "../../types/utils";
import { StartupStatusEnum } from "../../store/reducers/startup";
import { stopCieManager, watchCieAuthenticationSaga } from "../cie";
import { watchTestLoginRequestSaga } from "../testLoginSaga";
import {
  trackCieIDLoginSuccess,
  trackCieLoginSuccess,
  trackLoginFlowStarting,
  trackSpidLoginSuccess
} from "../../features/authentication/screens/analytics";
import { idpSelector } from "../../features/authentication/store/selectors";
import { IdpCIE, IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";

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

  trackLoginFlowStarting();

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

  const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
  const idpSelected = yield* select(idpSelector);

  if (O.isSome(idpSelected)) {
    switch (idpSelected.value.id) {
      case IdpCIE.id:
        trackCieLoginSuccess(isFastLoginEnabled ? "365" : "30");
        break;
      case IdpCIE_ID.id:
        // We currently request only a Level 2 login; however, once in the CieID app, if the only configured method is a Level 3 login, it will be possible to proceed with that higher level of security.
        // Unfortunately, at the time this event is logged, we do not have information about the actual level used for the recently completed login.
        trackCieIDLoginSuccess(isFastLoginEnabled ? "365" : "30");
        break;
      default:
        trackSpidLoginSuccess(
          isFastLoginEnabled ? "365" : "30",
          idpSelected.value.id
        );
    }
  }
  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield* put(analyticsAuthenticationCompleted());

  return action.payload.token;
}
