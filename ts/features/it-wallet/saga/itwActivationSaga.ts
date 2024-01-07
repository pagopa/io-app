import { SagaIterator } from "redux-saga";
import { call, takeLatest, cancel, fork, take } from "typed-redux-saga/macro";
import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";

import {
  itwActivationCompleted,
  itwActivationStart,
  itwActivationStop
} from "../store/actions/itwActivationActions";
import { ITW_ROUTES } from "../navigation/ItwRoutes";
import { ReduxSagaEffect } from "../../../types/utils";
import { SessionToken } from "../../../types/SessionToken";
import { loginSuccess } from "../store/actions/issuing/pid/itwIssuancePidCieActions";
import {
  stopCieManager,
  watchPidIssuingCieAuthSaga
} from "./issuance/pid/itwIssuancePidCieAuthSaga";

/**
 * Watcher for the IT wallet activation related sagas.
 */
export function* watchItwActivationSaga(): SagaIterator {
  /**
   * Handles the ITW activation start.
   */
  yield* takeLatest(itwActivationStart, handleActivationStart);

  /**
   * Handles the ITW activation stop.
   */
  yield* takeLatest(itwActivationStop, handleActivationStop);

  /**
   * Handles the ITW activation completed.
   */
  yield* takeLatest(itwActivationCompleted, handleActivationCompleted);
}

/**
 * A saga that makes the user go through the authentication process until
 * a SessionToken gets produced.
 */
export function* handleStartAuthenticationSaga(): Generator<
  ReduxSagaEffect,
  SessionToken,
  any
> {
  // Watch for login by CIE
  const watchCieAuthentication = yield* fork(watchPidIssuingCieAuthSaga);

  // Wait until the user has successfully authenticated with CIE
  // FIXME: show an error on LOGIN_FAILED?
  const action = yield* take(loginSuccess);

  yield* cancel(watchCieAuthentication);

  // stop cie manager from listening nfc
  yield* call(stopCieManager);

  return action.payload.token;
}

export function* handleStopAuthenticationSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  // stop cie manager from listening nfc
  yield* call(stopCieManager);
}

export function* handleActivationStart(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUING.PID.INFO
    })
  );
  yield* call(handleStartAuthenticationSaga);
}

export function* handleActivationStop(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN, {
      screen: ROUTES.MESSAGES_HOME
    })
  );
  yield* call(handleStopAuthenticationSaga);
}

export function* handleActivationCompleted(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN, {
      screen: ROUTES.ITWALLET_HOME
    })
  );
  yield* call(handleStopAuthenticationSaga);
}
