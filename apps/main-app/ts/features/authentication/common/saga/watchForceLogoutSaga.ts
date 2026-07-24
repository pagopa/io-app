import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";

import { restartCleanApplication } from "../../../../sagas/commons";
import { ReduxSagaEffect } from "../../../../types/utils";
import { sessionExpired } from "../store/actions";

/**
 * Watches for logout-related events during runtime
 * and triggers a clean restart of the application state.
 */
export function* watchForceLogoutSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(sessionExpired), restartCleanApplication);
}
