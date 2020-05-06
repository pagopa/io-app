import { Effect } from "redux-saga";
import { put, select, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { startApplicationInitialization } from "../../store/actions/application";
import {
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";
import { isLoggedInWithSessionInfo } from "../../store/reducers/authentication";

/**
 * Handles the expiration of the session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(sessionExpired), function*() {
    const isSessionOpened = yield select(isLoggedInWithSessionInfo);

    if (isSessionOpened) {
      // the app has opened a session, we need to request to backend to close it and restart the application
      // we get it by a soft logout
      yield put(logoutRequest({ keepUserData: true }));
    } else {
      // the app has not yet an opened session, just restart the application
      yield put(startApplicationInitialization());
    }
  });
}
