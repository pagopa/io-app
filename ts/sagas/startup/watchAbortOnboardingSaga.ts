import { call, put, take } from "typed-redux-saga/macro";
import { startApplicationInitialization } from "../../store/actions/application";
import { sessionInvalid } from "../../store/actions/authentication";
import { abortOnboarding } from "../../store/actions/onboarding";
import { ReduxSagaEffect } from "../../types/utils";
import { deletePin } from "../../utils/keychain";

export function* watchAbortOnboardingSaga(): Iterator<ReduxSagaEffect> {
  yield* take(abortOnboarding);
  yield* call(deletePin);
  // invalidate the session
  yield* put(sessionInvalid());
  // initialize the app from scratch (forcing an onboarding flow)
  yield* put(startApplicationInitialization());
}
