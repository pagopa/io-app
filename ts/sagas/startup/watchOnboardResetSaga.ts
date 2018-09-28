import { Effect } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { startApplicationInitialization } from "../../store/actions/application";
import { sessionInvalid } from "../../store/actions/authentication";
import { RESET_ONBOARDING } from "../../store/actions/constants";

export function* watchResetOnboardingSaga(): Iterator<Effect> {
  yield takeEvery(RESET_ONBOARDING, function*() {
    // invalidate the session
    yield put(sessionInvalid);
    // initialize the app from scratch (forcing an onboarding flow)
    yield put(startApplicationInitialization);
  });
}
