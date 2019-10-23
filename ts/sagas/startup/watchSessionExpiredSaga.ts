import { Effect } from "redux-saga";
import { put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { startApplicationInitialization } from "../../store/actions/application";
import { sessionExpired } from "../../store/actions/authentication";
import { resetToAuthenticationRoute } from "../../store/actions/navigation";

/**
 * Handles the expiration of session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(sessionExpired), function*() {

    // reset navigation route history
    yield put(resetToAuthenticationRoute);

    // Re-initialize the app
    // Since there was a SESSION_EXPIRED action, the user will be asked to
    // authenticate again.
    yield put(startApplicationInitialization());
  });
}
