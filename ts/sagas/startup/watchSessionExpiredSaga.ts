import { put, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { startApplicationInitialization } from "../../store/actions/application";
import { sessionExpired } from "../../store/actions/authentication";
import { clearCache } from "../../store/actions/profile";
import { ReduxSagaEffect } from "../../types/utils";
import { resetAssistanceData } from "../../utils/supportAssistance";

/**
 * Handles the expiration of the session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(getType(sessionExpired), function* () {
    // clean up any assistance data
    resetAssistanceData();
    yield* put(clearCache());
    // start again the application
    yield* put(startApplicationInitialization());
  });
}
