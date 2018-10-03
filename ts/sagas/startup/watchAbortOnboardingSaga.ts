import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { startApplicationInitialization } from "../../store/actions/application";
import { sessionInvalid } from "../../store/actions/authentication";
import { ABORT_ONBOARDING } from "../../store/actions/constants";

export function* watchAbortOnboardingSaga(): Iterator<Effect> {
  yield take(ABORT_ONBOARDING);
  // invalidate the session
  yield put(sessionInvalid());
  // initialize the app from scratch (forcing an onboarding flow)
  yield put(startApplicationInitialization());
}
