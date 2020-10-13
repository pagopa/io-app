import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { startApplicationInitialization } from "../../store/actions/application";
import { sessionExpired } from "../../store/actions/authentication";
import { deletePin } from "../../utils/keychain";
import { clearCache } from "../../store/actions/profile";

/**
 * Handles the expiration of the session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(sessionExpired), function* () {
    // delete saved pin
    yield call(deletePin);
    yield put(clearCache());
    // start again the application
    yield put(startApplicationInitialization());
  });
}
