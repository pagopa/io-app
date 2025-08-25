import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { sessionCorrupted, sessionExpired } from "../store/actions";
import { ReduxSagaEffect } from "../../../../types/utils";
import { restartCleanApplication } from "../../../../sagas/commons";

/**
 * Watches for session expiration or corruption events during runtime
 * and triggers a clean restart of the application state.
 */
export function* watchSessionExpiredOrCorruptedSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(
    [getType(sessionExpired), getType(sessionCorrupted)],
    restartCleanApplication
  );
}
