import { put, race, select, take, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { ReduxSagaEffect } from "../../../../types/utils";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  consolidateActiveSessionLoginData,
  setRetryActiveSessionLogin,
  setStartActiveSessionLogin
} from "../store/actions";
import {
  fastLoginOptInActiveSessionLoginSelector,
  idpSelectedActiveSessionLoginSelector,
  newTokenActiveSessionLoginSelector
} from "../store/selectors";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { sessionCorrupted } from "../../common/store/actions";
import { restartCleanApplication } from "../../../../sagas/commons";

export function* watchActiveSessionLoginSaga() {
  yield* takeLatest(
    [getType(setStartActiveSessionLogin), getType(setRetryActiveSessionLogin)],
    handleActiveSessionLoginSaga
  );
}

export function* watchSessionCorruptedSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(sessionCorrupted), restartCleanApplication);
}

export function* handleActiveSessionLoginSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  const { success, failure } = yield* race({
    success: take(activeSessionLoginSuccess),
    failure: take(activeSessionLoginFailure)
  });

  if (failure) {
    // the failure action are managed into the error screens
    // I decided to keep this code so that we have it ready in case we
    // decide to centralize management in the event of an error here.
    return;
  }

  if (success) {
    const newTokenActiveSessionLogin = yield* select(
      newTokenActiveSessionLoginSelector
    );
    const idpSelectedActiveSessionLogin = yield* select(
      idpSelectedActiveSessionLoginSelector
    );

    const fastLoginOptInActiveSessionLogin = yield* select(
      fastLoginOptInActiveSessionLoginSelector
    );
    if (
      idpSelectedActiveSessionLogin &&
      newTokenActiveSessionLogin &&
      fastLoginOptInActiveSessionLogin !== undefined
    ) {
      yield* put(
        consolidateActiveSessionLoginData({
          idp: idpSelectedActiveSessionLogin,
          token: newTokenActiveSessionLogin,
          fastLoginOptIn: fastLoginOptInActiveSessionLogin
        })
      );
    }
    yield* put(
      startApplicationInitialization({
        handleSessionExpiration: false,
        showIdentificationModalAtStartup: false,
        isActiveLoginSuccess: true
      })
    );
  }
}
