import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { startApplicationInitialization } from "../../store/actions/application";
import { sessionExpired } from "../../store/actions/authentication";
import { clearCache } from "../../store/actions/profile";
import { resetAssistanceData } from "../../utils/supportAssistance";
import { OPERISSUES_10_track } from "../startup";

/**
 * Handles the expiration of the session while the user is using the app.
 */
export function* watchSessionExpiredSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(sessionExpired), function* () {
    yield call(OPERISSUES_10_track, "watchSessionExpiredSaga_1", {
      isResetAssistanceDataDefined:
        resetAssistanceData !== null && resetAssistanceData !== undefined
    });
    // clean up any assistance data
    resetAssistanceData();
    yield call(OPERISSUES_10_track, "watchSessionExpiredSaga_2");
    yield put(clearCache());
    yield call(OPERISSUES_10_track, "watchSessionExpiredSaga_3");
    // start again the application
    yield put(startApplicationInitialization());
    yield call(OPERISSUES_10_track, "watchSessionExpiredSaga_4");
  });
}
