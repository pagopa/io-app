import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { sessionExpired } from "../../store/actions/authentication";
import { ReduxSagaEffect } from "../../types/utils";
import { restartCleanApplication } from "../commons";

/**
 * Handles the expiration of the session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(sessionExpired), restartCleanApplication);
}
