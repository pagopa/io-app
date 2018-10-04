import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { startApplicationInitialization } from "../../store/actions/application";
import { sessionInvalid } from "../../store/actions/authentication";
import { abortOnboarding } from "../../store/actions/onboarding";

export function* watchAbortOnboardingSaga(): Iterator<Effect> {
  yield take(getType(abortOnboarding));
  // invalidate the session
  yield put(sessionInvalid());
  // initialize the app from scratch (forcing an onboarding flow)
  yield put(startApplicationInitialization());
}
