import { Effect } from "redux-saga";
import { put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import {
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";

/**
 * Handles the expiration of session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(sessionExpired), function*() {
    // Send to backend the request of soft logout
    yield put(logoutRequest({ keepUserData: true }));
  });
}
