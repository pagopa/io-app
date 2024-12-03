/**
 * A saga to manage session invalidation
 */
import { put, select } from "typed-redux-saga/macro";
import { sessionInvalid } from "../store/actions/authentication";
import { isFirstRunAfterInstallSelector } from "../store/reducers/installation";
import { ReduxSagaEffect } from "../types/utils";
import { mixpanelTrack } from "../mixpanel";

/**
 * This generator function removes user data from previous application
 * installation
 */
export function* previousInstallationDataDeleteSaga(): Generator<
  ReduxSagaEffect,
  void,
  boolean
> {
  const isFirstRunAfterInstall: ReturnType<
    typeof isFirstRunAfterInstallSelector
  > = yield* select(isFirstRunAfterInstallSelector);

  if (isFirstRunAfterInstall) {
    // invalidate the session
    mixpanelTrack("SESSION_INVALID_IN_PREVIOUS_INSTALLATION");
    yield* put(sessionInvalid());
  }
}
