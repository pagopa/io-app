import { call, put, take } from "typed-redux-saga/macro";
import { startApplicationInitialization } from "../../../store/actions/application";
import { sessionInvalid } from "../../authentication/common/store/actions";
import { abortOnboarding } from "../store/actions";
import { ReduxSagaEffect } from "../../../types/utils";
import { deletePin } from "../../../utils/keychain";
import { trackLoginUserExit } from "../../authentication/common/analytics";

export function* watchAbortOnboardingSaga(): Iterator<ReduxSagaEffect> {
  yield* take(abortOnboarding);

  trackLoginUserExit();

  yield* call(deletePin);
  // invalidate the session
  yield* put(sessionInvalid());
  // initialize the app from scratch (forcing an onboarding flow)
  yield* put(startApplicationInitialization());
}
