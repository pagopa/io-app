import { Effect } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { startApplicationInitialization } from "../../store/actions/application";
import { sessionExpired } from "../../store/actions/authentication";

import { saveNavigationStateSaga } from "./saveNavigationStateSaga";

/**
 * Handles the expiration of session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(sessionExpired), function*() {
    // Save the navigation state
    yield call(saveNavigationStateSaga);

    // Re-initialize the app
    // Since there was a SESSION_EXPIRED action, the user will be asked to
    // authenticate again.
    yield put(startApplicationInitialization());
  });
}
