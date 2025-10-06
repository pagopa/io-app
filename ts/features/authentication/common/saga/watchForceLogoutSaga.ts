import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { sessionCorrupted, sessionExpired } from "../store/actions";
import { ReduxSagaEffect } from "../../../../types/utils";
import {
  resetAssistanceDataAndClearCache,
  restartCleanApplication
} from "../../../../sagas/commons";
import { setLoggedOutUserWithDifferentCF } from "../../activeSessionLogin/store/actions";

/**
 * Watches for logout-related events during runtime
 * and triggers a clean restart of the application state.
 */
export function* watchForceLogoutSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(
    [getType(sessionExpired), getType(sessionCorrupted)],
    restartCleanApplication
  );
}

export function* watchForceLogoutOnDifferentCF(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(
    getType(setLoggedOutUserWithDifferentCF),
    resetAssistanceDataAndClearCache
  );
}
