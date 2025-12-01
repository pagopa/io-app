import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { sessionExpired } from "../store/actions";
import { ReduxSagaEffect } from "../../../../types/utils";
import {
  logoutUserAfterActiveSessionLogin,
  restartCleanApplication
} from "../../../../sagas/commons";
import {
  requestSessionCorrupted,
  setLoggedOutUserWithDifferentCF
} from "../../activeSessionLogin/store/actions";

/**
 * Watches for logout-related events during runtime
 * and triggers a clean restart of the application state.
 */
export function* watchForceLogoutSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(sessionExpired), restartCleanApplication);
}

export function* watchForceLogoutActiveSessionLogin(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(
    [
      getType(setLoggedOutUserWithDifferentCF),
      getType(requestSessionCorrupted)
    ],
    logoutUserAfterActiveSessionLogin
  );
}
